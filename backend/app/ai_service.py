# backend/app/ai_service.py
import openai
from transformers import pipeline
import asyncio
from typing import Optional, Dict, List, Any
from .config import settings
import redis
import json
import hashlib
import logging
import time
from datetime import datetime, timedelta
import uuid
from enum import Enum
import aiofiles
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Redis for caching
redis_client = redis.from_url(settings.REDIS_URL)

# Initialize OpenAI
openai.api_key = settings.OPENAI_API_KEY

# Initialize local models
summarizer = None
code_generator = None
text_generator = None
image_generator = None

class ContentType(str, Enum):
    TEXT = "text"
    CODE = "code"
    SUMMARY = "summary"
    EMAIL = "email"
    BLOG_POST = "blog_post"
    SOCIAL_MEDIA = "social_media"
    AD_COPY = "ad_copy"
    PRODUCT_DESCRIPTION = "product_description"
    TRANSLATION = "translation"
    CREATIVE_WRITING = "creative_writing"
    TECHNICAL_DOCUMENTATION = "technical_documentation"
    MARKETING_COPY = "marketing_copy"
    NEWS_ARTICLE = "news_article"
    REVIEW = "review"
    FAQ = "faq"
    TUTORIAL = "tutorial"
    PRESENTATION = "presentation"
    PROPOSAL = "proposal"
    REPORT = "report"
    ANALYSIS = "analysis"

class AIModel(str, Enum):
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    GPT_4 = "gpt-4"
    GPT_4_TURBO = "gpt-4-turbo-preview"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"
    CLAUDE_3_OPUS = "claude-3-opus-20240229"
    LOCAL_TEXT = "local-text"
    LOCAL_CODE = "local-code"
    LOCAL_SUMMARY = "local-summary"

def init_local_models():
    """Initialize local AI models for fallback and offline capabilities"""
    global summarizer, code_generator, text_generator, image_generator
    try:
        logger.info("Initializing local AI models...")
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        code_generator = pipeline("text-generation", model="Salesforce/codegen-350M-mono")
        text_generator = pipeline("text-generation", model="gpt2")
        logger.info("Local models initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize local models: {e}")
        # Continue without local models

class AIService:
    @staticmethod
    def get_cache_key(prompt: str, content_type: str, model: str, **kwargs) -> str:
        """Generate cache key for content generation"""
        content = f"{prompt}:{content_type}:{model}:{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.md5(content.encode()).hexdigest()
    
    @staticmethod
    async def generate_content(
        prompt: str,
        content_type: str,
        model: str = "gpt-3.5-turbo",
        max_tokens: int = 500,
        temperature: float = 0.7,
        language: str = "en",
        style: str = "professional",
        **kwargs
    ) -> tuple[str, str, Dict[str, Any]]:
        """Generate content with enhanced features and error handling"""
        start_time = time.time()
        generation_id = str(uuid.uuid4())
        
        logger.info(f"Starting content generation - ID: {generation_id}, Type: {content_type}, Model: {model}")
        
        # Check cache first
        cache_key = AIService.get_cache_key(prompt, content_type, model, **kwargs)
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            result = json.loads(cached_result)
            logger.info(f"Cache hit for generation {generation_id}")
            return result["content"], result["model"], result.get("metadata", {})
        
        try:
            # Rate limiting check
            await AIService._check_rate_limit()
            
            # Generate content based on type
            if content_type == ContentType.TEXT:
                content = await AIService._generate_text(prompt, model, max_tokens, temperature, style, language)
            elif content_type == ContentType.CODE:
                content = await AIService._generate_code(prompt, model, max_tokens, temperature, **kwargs)
            elif content_type == ContentType.SUMMARY:
                content = await AIService._generate_summary(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.EMAIL:
                content = await AIService._generate_email(prompt, model, max_tokens, temperature, style)
            elif content_type == ContentType.BLOG_POST:
                content = await AIService._generate_blog_post(prompt, model, max_tokens, temperature, style)
            elif content_type == ContentType.SOCIAL_MEDIA:
                content = await AIService._generate_social_media(prompt, model, max_tokens, temperature, **kwargs)
            elif content_type == ContentType.AD_COPY:
                content = await AIService._generate_ad_copy(prompt, model, max_tokens, temperature, **kwargs)
            elif content_type == ContentType.PRODUCT_DESCRIPTION:
                content = await AIService._generate_product_description(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.TRANSLATION:
                content = await AIService._generate_translation(prompt, model, max_tokens, language, **kwargs)
            elif content_type == ContentType.CREATIVE_WRITING:
                content = await AIService._generate_creative_writing(prompt, model, max_tokens, temperature, style)
            elif content_type == ContentType.TECHNICAL_DOCUMENTATION:
                content = await AIService._generate_technical_docs(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.MARKETING_COPY:
                content = await AIService._generate_marketing_copy(prompt, model, max_tokens, temperature, style)
            elif content_type == ContentType.NEWS_ARTICLE:
                content = await AIService._generate_news_article(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.REVIEW:
                content = await AIService._generate_review(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.FAQ:
                content = await AIService._generate_faq(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.TUTORIAL:
                content = await AIService._generate_tutorial(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.PRESENTATION:
                content = await AIService._generate_presentation(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.PROPOSAL:
                content = await AIService._generate_proposal(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.REPORT:
                content = await AIService._generate_report(prompt, model, max_tokens, temperature)
            elif content_type == ContentType.ANALYSIS:
                content = await AIService._generate_analysis(prompt, model, max_tokens, temperature)
            else:
                raise ValueError(f"Unknown content type: {content_type}")
            
            # Calculate generation time
            generation_time = time.time() - start_time
            
            # Prepare metadata
            metadata = {
                "generation_id": generation_id,
                "generation_time": generation_time,
                "tokens_used": len(content.split()),
                "timestamp": datetime.utcnow().isoformat(),
                "parameters": {
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "language": language,
                    "style": style,
                    **kwargs
                }
            }
            
            # Cache the result with metadata
            cache_data = {
                "content": content,
                "model": model,
                "metadata": metadata
            }
            redis_client.setex(
                cache_key,
                3600,  # 1 hour TTL
                json.dumps(cache_data)
            )
            
            logger.info(f"Content generation completed - ID: {generation_id}, Time: {generation_time:.2f}s")
            return content, model, metadata
            
        except Exception as e:
            logger.error(f"Content generation failed - ID: {generation_id}, Error: {str(e)}")
            raise Exception(f"AI generation failed: {str(e)}")
    
    @staticmethod
    async def _check_rate_limit():
        """Check and enforce rate limiting"""
        # Simple rate limiting - can be enhanced with more sophisticated logic
        current_time = time.time()
        rate_limit_key = "rate_limit"
        
        # Get current request count
        current_count = redis_client.get(rate_limit_key)
        if current_count is None:
            redis_client.setex(rate_limit_key, 60, 1)  # 1 minute window
        else:
            count = int(current_count)
            if count >= 100:  # 100 requests per minute
                raise Exception("Rate limit exceeded. Please try again later.")
            redis_client.incr(rate_limit_key)
    
    @staticmethod
    async def _generate_text(prompt: str, model: str, max_tokens: int, temperature: float = 0.7, style: str = "professional", language: str = "en") -> str:
        """Generate general text content"""
        if model.startswith("gpt"):
            system_prompt = f"You are a helpful AI assistant that generates {style} content in {language}. Provide clear, engaging, and well-structured responses."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        else:
            # Use local model as fallback
            if text_generator:
                result = text_generator(prompt, max_length=max_tokens, temperature=temperature, do_sample=True)
                return result[0]['generated_text']
            return "Local text generation model not available"
    
    @staticmethod
    async def _generate_code(prompt: str, model: str, max_tokens: int, temperature: float = 0.7, language: str = "python", **kwargs) -> str:
        """Generate code content"""
        if model.startswith("gpt"):
            system_prompt = f"You are an expert {language} developer. Generate clean, well-commented, and efficient code. Follow best practices and include proper error handling."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        else:
            # Use local code generation model
            if code_generator:
                result = code_generator(prompt, max_length=max_tokens, temperature=temperature, do_sample=True)
                return result[0]['generated_text']
            return "Code generation model not available"
    
    @staticmethod
    async def _generate_summary(prompt: str, model: str, max_tokens: int = 150, temperature: float = 0.3) -> str:
        """Generate summary content"""
        if len(prompt.split()) < 50:
            return "Text too short for summarization. Please provide at least 50 words."
        
        if model.startswith("gpt"):
            system_prompt = "You are a summarization expert. Create concise, accurate summaries that capture the key points and main ideas. Maintain the original tone and context."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Summarize the following text:\n\n{prompt}"}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        else:
            # Use local summarization model
            if summarizer:
                result = summarizer(prompt, max_length=max_tokens, min_length=30, do_sample=False)
                return result[0]['summary_text']
            return "Summarization model not available"
    
    @staticmethod
    async def _generate_email(prompt: str, model: str, max_tokens: int, temperature: float, style: str) -> str:
        """Generate email content"""
        if model.startswith("gpt"):
            system_prompt = f"You are a professional email writer. Generate {style} emails that are clear, engaging, and appropriate for business communication. Include proper greeting and closing."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Email generation requires GPT models"
    
    @staticmethod
    async def _generate_blog_post(prompt: str, model: str, max_tokens: int, temperature: float, style: str) -> str:
        """Generate blog post content"""
        if model.startswith("gpt"):
            system_prompt = f"You are a professional blog writer. Create engaging, well-structured blog posts in a {style} style. Include an attention-grabbing headline, clear sections, and a compelling conclusion."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Blog post generation requires GPT models"
    
    @staticmethod
    async def _generate_social_media(prompt: str, model: str, max_tokens: int, temperature: float, platform: str = "twitter") -> str:
        """Generate social media content"""
        if model.startswith("gpt"):
            platform_guidelines = {
                "twitter": "Keep it under 280 characters, use hashtags strategically, and make it engaging",
                "facebook": "Write engaging posts that encourage interaction and sharing",
                "instagram": "Create visually appealing captions with relevant hashtags",
                "linkedin": "Write professional, informative posts that add value to your network"
            }
            
            system_prompt = f"You are a social media expert. Generate {platform} content that is {platform_guidelines.get(platform, 'engaging and appropriate')}."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Social media generation requires GPT models"
    
    @staticmethod
    async def _generate_ad_copy(prompt: str, model: str, max_tokens: int, temperature: float, ad_type: str = "display") -> str:
        """Generate advertising copy"""
        if model.startswith("gpt"):
            system_prompt = f"You are a professional copywriter specializing in {ad_type} advertising. Create compelling, persuasive ad copy that drives action and converts prospects into customers."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Ad copy generation requires GPT models"
    
    @staticmethod
    async def _generate_product_description(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate product descriptions"""
        if model.startswith("gpt"):
            system_prompt = "You are a professional product copywriter. Create compelling product descriptions that highlight key features, benefits, and unique selling points. Use persuasive language that drives sales."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Product description generation requires GPT models"
    
    @staticmethod
    async def _generate_translation(prompt: str, model: str, max_tokens: int, target_language: str, source_language: str = "auto") -> str:
        """Generate translations"""
        if model.startswith("gpt"):
            system_prompt = f"You are a professional translator. Translate the given text from {source_language} to {target_language}. Maintain the original tone, style, and meaning while ensuring natural, fluent output."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.3
            )
            return response.choices[0].message.content
        return "Translation requires GPT models"
    
    @staticmethod
    async def _generate_creative_writing(prompt: str, model: str, max_tokens: int, temperature: float, genre: str = "general") -> str:
        """Generate creative writing content"""
        if model.startswith("gpt"):
            system_prompt = f"You are a creative writing expert specializing in {genre}. Create engaging, original content that captivates readers with vivid descriptions, compelling characters, and immersive storytelling."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Creative writing requires GPT models"
    
    @staticmethod
    async def _generate_technical_docs(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate technical documentation"""
        if model.startswith("gpt"):
            system_prompt = "You are a technical writing expert. Create clear, comprehensive technical documentation that is easy to understand and follow. Include code examples, step-by-step instructions, and troubleshooting tips."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Technical documentation requires GPT models"
    
    @staticmethod
    async def _generate_marketing_copy(prompt: str, model: str, max_tokens: int, temperature: float, campaign_type: str = "general") -> str:
        """Generate marketing copy"""
        if model.startswith("gpt"):
            system_prompt = f"You are a marketing copywriter specializing in {campaign_type} campaigns. Create persuasive, compelling copy that resonates with target audiences and drives desired actions."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Marketing copy requires GPT models"
    
    @staticmethod
    async def _generate_news_article(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate news articles"""
        if model.startswith("gpt"):
            system_prompt = "You are a professional journalist. Write objective, well-researched news articles that follow journalistic standards. Include proper structure with headline, lead, body, and conclusion."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "News article generation requires GPT models"
    
    @staticmethod
    async def _generate_review(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate product/service reviews"""
        if model.startswith("gpt"):
            system_prompt = "You are a professional reviewer. Write honest, balanced reviews that provide valuable insights to potential customers. Include both positive and negative aspects when appropriate."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Review generation requires GPT models"
    
    @staticmethod
    async def _generate_faq(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate FAQ content"""
        if model.startswith("gpt"):
            system_prompt = "You are a customer service expert. Create comprehensive FAQ sections that address common questions and concerns. Provide clear, helpful answers that reduce support burden."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "FAQ generation requires GPT models"
    
    @staticmethod
    async def _generate_tutorial(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate tutorial content"""
        if model.startswith("gpt"):
            system_prompt = "You are an educational content creator. Write step-by-step tutorials that are easy to follow and understand. Include clear instructions, examples, and troubleshooting tips."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Tutorial generation requires GPT models"
    
    @staticmethod
    async def _generate_presentation(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate presentation content"""
        if model.startswith("gpt"):
            system_prompt = "You are a presentation expert. Create engaging presentation content with clear structure, compelling points, and visual suggestions. Include speaker notes and slide transitions."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Presentation generation requires GPT models"
    
    @staticmethod
    async def _generate_proposal(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate business proposals"""
        if model.startswith("gpt"):
            system_prompt = "You are a business proposal expert. Create professional, persuasive proposals that clearly outline objectives, methodology, timeline, and value proposition."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Proposal generation requires GPT models"
    
    @staticmethod
    async def _generate_report(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate business reports"""
        if model.startswith("gpt"):
            system_prompt = "You are a business analyst. Create comprehensive reports with executive summary, key findings, analysis, and recommendations. Use data-driven insights and professional formatting."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Report generation requires GPT models"
    
    @staticmethod
    async def _generate_analysis(prompt: str, model: str, max_tokens: int, temperature: float) -> str:
        """Generate analytical content"""
        if model.startswith("gpt"):
            system_prompt = "You are a data analyst and researcher. Provide thorough analysis with insights, trends, patterns, and actionable recommendations based on the given information."
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            return response.choices[0].message.content
        return "Analysis generation requires GPT models"
    
    @staticmethod
    async def generate_batch_content(requests: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate multiple content pieces in batch"""
        results = []
        for request in requests:
            try:
                content, model, metadata = await AIService.generate_content(**request)
                results.append({
                    "success": True,
                    "content": content,
                    "model": model,
                    "metadata": metadata
                })
            except Exception as e:
                results.append({
                    "success": False,
                    "error": str(e),
                    "request": request
                })
        return results
    
    @staticmethod
    async def optimize_prompt(prompt: str, content_type: str) -> str:
        """Optimize prompts for better AI generation"""
        if not prompt.strip():
            return "Please provide a more specific prompt for better results."
        
        optimization_tips = {
            ContentType.TEXT: "Be specific about the topic, tone, and target audience. Include key points you want covered.",
            ContentType.CODE: "Specify the programming language, framework, and requirements. Include error handling needs.",
            ContentType.EMAIL: "Mention the purpose, recipient, and desired tone. Include any specific information to include.",
            ContentType.BLOG_POST: "Specify the topic, target audience, and key points. Include SEO keywords if needed.",
            ContentType.SOCIAL_MEDIA: "Mention the platform, target audience, and campaign goals. Include hashtags or mentions.",
            ContentType.AD_COPY: "Specify the product/service, target audience, and call-to-action. Include unique selling points.",
        }
        
        tip = optimization_tips.get(content_type, "Be specific about your requirements and include relevant context.")
        
        return f"Optimization tip: {tip}\n\nYour current prompt: {prompt}"
    
    @staticmethod
    async def get_content_suggestions(prompt: str, content_type: str) -> List[str]:
        """Get content suggestions based on prompt analysis"""
        suggestions = []
        
        if len(prompt.split()) < 10:
            suggestions.append("Consider adding more details to your prompt for better results")
        
        if content_type in [ContentType.EMAIL, ContentType.BLOG_POST, ContentType.SOCIAL_MEDIA]:
            suggestions.append("Specify your target audience for more targeted content")
        
        if content_type == ContentType.CODE:
            suggestions.append("Include specific requirements and constraints")
            suggestions.append("Mention the programming language and framework")
        
        if content_type == ContentType.MARKETING_COPY:
            suggestions.append("Include your unique selling proposition")
            suggestions.append("Specify the campaign goals and metrics")
        
        return suggestions