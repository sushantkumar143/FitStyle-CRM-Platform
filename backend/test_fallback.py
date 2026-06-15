import sys
import os
import unittest
from unittest.mock import patch, MagicMock

# Add app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services import ai_service
from app.core.config import get_settings


class TestMultiLLMFallback(unittest.TestCase):
    @patch("groq.Groq")
    @patch("openai.OpenAI")
    def test_fallback_flow(self, mock_openai, mock_groq):
        # Setup settings
        settings = get_settings()
        settings.AI_PROVIDER = "groq"
        settings.GROQ_API_KEY_1 = "test-key-1"
        settings.GROQ_API_KEY_2 = "test-key-2"
        settings.GROQ_API_KEY_3 = "test-key-3"
        settings.OLLAMA_BASE_URL = "http://localhost:11434/v1"

        # Mock Groq to fail for Key 1 and Key 2, and succeed for Key 3
        # We need to simulate client instances
        mock_groq_inst_1 = MagicMock()
        mock_groq_inst_1.chat.completions.create.side_effect = Exception("Key 1 Rate Limit / Error")

        mock_groq_inst_2 = MagicMock()
        mock_groq_inst_2.chat.completions.create.side_effect = Exception("Key 2 Unauthorized")

        mock_groq_inst_3 = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Success response from Key 3"
        mock_groq_inst_3.chat.completions.create.return_value = mock_response

        # Side effects for Groq creation
        mock_groq.side_effect = [mock_groq_inst_1, mock_groq_inst_2, mock_groq_inst_3]

        # Execute
        res = ai_service._chat("system prompt", "user prompt")

        # Verify
        self.assertEqual(res, "Success response from Key 3")
        self.assertEqual(mock_groq.call_count, 3)
        self.assertEqual(mock_openai.call_count, 0)

    @patch("groq.Groq")
    @patch("openai.OpenAI")
    def test_fallback_to_ollama(self, mock_openai, mock_groq):
        # Setup settings
        settings = get_settings()
        settings.AI_PROVIDER = "groq"
        settings.GROQ_API_KEY_1 = "test-key-1"
        settings.GROQ_API_KEY_2 = "test-key-2"
        settings.GROQ_API_KEY_3 = "test-key-3"
        settings.OLLAMA_BASE_URL = "http://localhost:11434/v1"
        settings.OLLAMA_MODEL = "llama3"

        # Mock Groq to fail for all keys
        mock_groq_inst = MagicMock()
        mock_groq_inst.chat.completions.create.side_effect = Exception("Key error")
        mock_groq.return_value = mock_groq_inst

        # Mock Ollama (OpenAI client wrapper) to succeed
        mock_ollama_inst = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Success response from Ollama"
        mock_ollama_inst.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_ollama_inst

        # Execute
        res = ai_service._chat("system prompt", "user prompt")

        # Verify
        self.assertEqual(res, "Success response from Ollama")
        self.assertEqual(mock_groq.call_count, 3)
        self.assertEqual(mock_openai.call_count, 1)

    @patch("groq.Groq")
    @patch("openai.OpenAI")
    def test_ollama_fails_no_crash(self, mock_openai, mock_groq):
        # Setup settings
        settings = get_settings()
        settings.AI_PROVIDER = "groq"
        settings.GROQ_API_KEY_1 = "test-key-1"
        settings.GROQ_API_KEY_2 = "test-key-2"
        settings.GROQ_API_KEY_3 = "test-key-3"
        settings.OLLAMA_BASE_URL = "http://localhost:11434/v1"
        settings.OLLAMA_MODEL = "llama3"

        # Mock everything to fail
        mock_groq_inst = MagicMock()
        mock_groq_inst.chat.completions.create.side_effect = Exception("Key error")
        mock_groq.return_value = mock_groq_inst

        mock_ollama_inst = MagicMock()
        mock_ollama_inst.chat.completions.create.side_effect = Exception("Ollama connection refused")
        mock_openai.return_value = mock_ollama_inst

        # Execute
        res = ai_service._chat("system prompt", "user prompt")

        # Verify
        self.assertEqual(res, "I'm unable to generate AI content right now. Please check your API key configuration.")


if __name__ == "__main__":
    unittest.main()
