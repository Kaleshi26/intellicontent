# backend/app/ai_service.py
import openai
from transformers import pipeline
import asyncio
from typing import Optional
from .config import settings
import redis
import json
import hashlib

# Initialize Redis for caching
redis_client = redis.from_url(settings.REDIS_URL)

# Initialize OpenAI
openai.api_key = settings.OPENAI_API_KEY

# Initialize local models
summarizer = None
code_generator = None

def init_local_models():
    global summarizer, code_generator
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    code_generator = pipeline("text-generation", model="Salesforce/codegen-350M-mono")

class AIService:
    @staticmethod
    def get_cache_key(prompt: str, content_type: str, model: str) -> str:
        content = f"{prompt}:{content_type}:{model}"
        return hashlib.md5(content.encode()).hexdigest()
    
    @staticmethod
    async def generate_content(
        prompt: str,
        content_type: str,
        model: str = "gpt-3.5-turbo",
        max_tokens: int = 500
    ) -> tuple[str, str]:
        # Check cache first
        cache_key = AIService.get_cache_key(prompt, content_type, model)
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            result = json.loads(cached_result)
            return result["content"], result["model"]
        
        try:
            if content_type == "text":
                content = await AIService._generate_text(prompt, model, max_tokens)
            elif content_type == "code":
                content = await AIService._generate_code(prompt, model, max_tokens)
            elif content_type == "summary":
                content = await AIService._generate_summary(prompt, model)
            else:
                raise ValueError(f"Unknown content type: {content_type}")
            
            # Cache the result
            redis_client.setex(
                cache_key,
                3600,  # 1 hour TTL
                json.dumps({"content": content, "model": model})
            )
            
            return content, model
            
        except Exception as e:
            raise Exception(f"AI generation failed: {str(e)}")
    
    @staticmethod
    async def _generate_text(prompt: str, model: str, max_tokens: int) -> str:
        if model.startswith("gpt"):
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        else:
            # Use local model as fallback
            return "Local model generation not implemented for text"
    
    @staticmethod
    async def _generate_code(prompt: str, model: str, max_tokens: int) -> str:
        if model.startswith("gpt"):
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": "You are a code generation assistant. Generate clean, well-commented code."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        else:
            # Use local code generation model
            if code_generator:
                result = code_generator(prompt, max_length=max_tokens, num_return_sequences=1)
                return result[0]['generated_text']
            return "Code generation model not initialized"
    
    @staticmethod
    async def _generate_summary(prompt: str, model: str) -> str:
        if len(prompt.split()) < 50:
            return "Text too short for summarization"
        
        if model.startswith("gpt"):
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": "You are a summarization assistant. Provide concise summaries."},
                    {"role": "user", "content": f"Summarize the following text:\n\n{prompt}"}
                ],
                max_tokens=150
            )
            return response.choices[0].message.content
        else:
            # Use local summarization model
            if summarizer:
                result = summarizer(prompt, max_length=130, min_length=30, do_sample=False)
                return result[0]['summary_text']
            return "Summarization model not initialized"