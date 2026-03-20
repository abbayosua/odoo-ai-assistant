# 🤖 Odoo AI Assistant

<div align="center">

[![Odoo Version](https://img.shields.io/badge/Odoo-16%20%7C%2017%20%7C%2018%20%7C%2019-875A7B?style=flat-square)](https://www.odoo.com/)
[![License](https://img.shields.io/badge/License-LGPL%20v3-blue?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/abbayosua/odoo-ai-assistant?style=flat-square)](https://github.com/abbayosua/odoo-ai-assistant/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/abbayosua/odoo-ai-assistant?style=flat-square)](https://github.com/abbayosua/odoo-ai-assistant/issues)

**Bring the power of AI to your Odoo Community Edition**

[Features](#-features) • [Installation](#-installation) • [Configuration](#-configuration) • [Usage](#-usage) • [Screenshots](#-screenshots)

</div>

---

## 📖 Overview

**Odoo AI Assistant** is a powerful module that brings Enterprise-grade AI capabilities to Odoo Community Edition. It enables businesses to leverage artificial intelligence for content generation, document processing, data entry assistance, and much more.

### Why Odoo AI Assistant?

| Problem | Solution |
|---------|----------|
| ❌ AI features only in Enterprise | ✅ Full AI capabilities for Community Edition |
| ❌ Manual data entry is time-consuming | ✅ AI-powered autocomplete and smart fill |
| ❌ Document processing requires manual work | ✅ Automatic OCR and data extraction |
| ❌ Email composition takes too long | ✅ AI-assisted email drafting |
| ❌ No intelligent search | ✅ Natural language queries |

---

## ✨ Features

### 🗨️ AI Chat Interface
- Floating chat widget accessible from anywhere in Odoo
- Natural language queries about your data
- Context-aware responses
- Conversation history
- Streaming responses

### ⚡ Smart Field Autocomplete
- AI-powered suggestions for text fields
- Context-aware autocomplete
- Works with any model
- Tab to accept, Escape to reject
- Customizable prompts per field

### 📄 Document Intelligence
- Upload and process documents (PDF, images, Word)
- OCR text extraction
- Automatic data mapping
- Batch document processing
- Support for invoices, business cards, contracts

### 📧 Email Assistant
- AI-powered email composition
- Tone adjustment (formal, friendly, professional)
- Translation to multiple languages
- Subject line suggestions
- Reply drafting

### 🔄 Multiple AI Providers
- **OpenAI** (GPT-4o, GPT-4o-mini, GPT-4 Turbo)
- **Ollama** (Local AI - Llama 3.2, Mistral, etc.)
- **Anthropic Claude** (Claude 3 Haiku, Sonnet)
- **Google Gemini** (Coming soon)
- Easy provider switching
- Fallback support

### 🔌 Integrations
- **CRM**: Lead scoring, follow-up suggestions
- **Sales**: Quote generation, product descriptions
- **Inventory**: Auto-generate descriptions
- **HR**: Job descriptions, evaluation templates
- **Accounting**: Invoice data extraction

---

## 📋 Requirements

### Odoo Requirements
- Odoo Community Edition 16, 17, 18, or 19
- Python 3.8 or higher

### Python Dependencies
```
openai>=1.0.0
anthropic>=0.18.0
requests>=2.28.0
Pillow>=9.0.0
pdfminer.six>=20221105
python-docx>=0.8.11
```

### Optional (for local AI)
- Ollama installed locally
- 8GB+ RAM for local models

---

## 📥 Installation

### Method 1: Download from GitHub

```bash
# Navigate to your Odoo addons directory
cd /path/to/odoo/addons

# Clone the repository
git clone https://github.com/abbayosua/odoo-ai-assistant.git

# The module will be in the 'ai_assistant' folder
```

### Method 2: Download ZIP

1. Download the latest release from [GitHub Releases](https://github.com/abbayosua/odoo-ai-assistant/releases)
2. Extract to your Odoo addons directory
3. Rename folder to `ai_assistant`

### Method 3: Odoo App Store (Coming Soon)
Search for "AI Assistant" in the Odoo App Store

---

## ⚙️ Configuration

### Step 1: Install the Module

1. Go to **Apps** → **Update Apps List**
2. Search for "AI Assistant"
3. Click **Install**

### Step 2: Configure AI Provider

1. Go to **Settings** → **AI Assistant** → **Configuration**
2. Select your AI Provider (OpenAI, Ollama, Anthropic)
3. Enter your API key (for cloud providers)
4. Click **Test Connection** to verify

### Step 3: Set Permissions

1. Go to **Settings** → **Users & Companies** → **Users**
2. Open user record
3. In "Technical Settings", enable:
   - AI Assistant: Use Chat
   - AI Assistant: Document Processing
   - AI Assistant: Admin (for configuration)

### OpenAI Configuration Example

```python
Provider: OpenAI
API Key: sk-proj-...
Model: gpt-4o-mini (Recommended for cost-effectiveness)
Temperature: 0.7
Max Tokens: 2000
```

### Ollama (Local AI) Configuration

```bash
# First, install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull llama3.2

# Configure in Odoo
Provider: Ollama
Base URL: http://localhost:11434
Model: llama3.2
```

---

## 🎯 Usage

### Using the Chat Interface

1. Click the **AI icon** in the top-right corner of Odoo
2. Type your question or request
3. Press Enter or click Send
4. View the AI response with streaming

**Example Queries:**
```
"Show me all unpaid invoices over $1000"
"Draft an email to customer John about their order delay"
"Generate a product description for item SKU-12345"
"Summarize my sales performance this month"
```

### Using Smart Autocomplete

1. Navigate to any form (e.g., Product, Contact)
2. Click on a text field
3. Press **Tab** to get AI suggestions
4. Press **Enter** to accept or **Escape** to reject

### Processing Documents

1. Go to **AI Assistant** → **Documents**
2. Click **Upload**
3. Select your document (PDF, image, Word)
4. Choose the target model (e.g., Invoice, Contact)
5. Review extracted data
6. Click **Create Record** to import

### Composing Emails with AI

1. Go to any record with email functionality
2. Click **Send Email**
3. Click the **AI Wand** icon in the editor
4. Choose a prompt or type your own:
   - "Write a follow-up email"
   - "Draft a thank you message"
   - "Translate to Spanish"
5. Review and edit the result
6. Send when ready

---

## 📸 Screenshots

### AI Chat Interface
```
┌─────────────────────────────────────────┐
│ 🤖 AI Assistant                    [×]  │
├─────────────────────────────────────────┤
│                                         │
│ 👤 Show me top 5 customers this month   │
│                                         │
│ 🤖 Here are your top 5 customers:       │
│    1. Acme Corp - $45,230               │
│    2. Tech Solutions - $38,450          │
│    3. Global Industries - $29,100       │
│    4. Smith & Co - $21,800              │
│    5. Johnson Ltd - $18,500             │
│                                         │
│    Would you like me to create a        │
│    report?                              │
│                                         │
├─────────────────────────────────────────┤
│ [Type your message...            ] [Send]│
└─────────────────────────────────────────┘
```

### Smart Autocomplete
```
┌─────────────────────────────────────────┐
│ Product Name: [Laptop Pro 15"    ▼]     │
│              ┌─────────────────────────┐│
│              │ 💡 AI Suggestions:      ││
│              │ • Laptop Pro 15" - High ││
│              │   Performance Notebook  ││
│              │ • Laptop Pro 15" Gaming ││
│              │   Edition               ││
│              └─────────────────────────┘│
│                                         │
│ Description: [AI can help fill this... ]│
│              ┌─────────────────────────┐│
│              │ ✨ Generated:           ││
│              │ Powerful 15.6" laptop   ││
│              │ featuring Intel Core i7,││
│              │ 16GB RAM, 512GB SSD...  ││
│              │ [Accept] [Regenerate]   ││
│              └─────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Privacy

### Data Handling
- API keys are encrypted in the database
- No data is stored on external servers (except when sent to AI provider)
- Full control over what data is sent to AI
- Audit logs of all AI requests

### Access Control
- Role-based permissions
- Admin-only configuration
- User-level feature toggles
- Rate limiting per user

### Privacy Options
- Disable AI for sensitive models
- Local AI option (Ollama) for complete privacy
- Data masking for PII
- Retention policy for conversation history

---

## 🌍 Internationalization

The module is translated into:
- 🇺🇸 English (default)
- 🇫🇷 French
- 🇪🇸 Spanish
- 🇩🇪 German
- 🇵🇹 Portuguese
- 🇮🇩 Indonesian
- 🇳🇱 Dutch

Want to add your language? [Contribute a translation!](CONTRIBUTING.md)

---

## 🧪 Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/abbayosua/odoo-ai-assistant.git
cd odoo-ai-assistant

# Create a virtual environment
python -m venv venv
source venv/bin/activate

# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/
```

### Run Tests

```bash
# Unit tests
python -m pytest tests/unit/

# Integration tests
python -m pytest tests/integration/

# Coverage report
python -m pytest --cov=ai_assistant tests/
```

### Code Style

We follow Odoo's coding guidelines:
- Python: PEP 8 + Odoo conventions
- JavaScript: ESLint with Odoo config
- XML: Odoo XML conventions

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea? 

1. Check [existing issues](https://github.com/abbayosua/odoo-ai-assistant/issues)
2. If not found, [create a new issue](https://github.com/abbayosua/odoo-ai-assistant/issues/new)
3. Use the appropriate template

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development setup
- Pull request process
- Coding standards

---

## 📄 License

This module is licensed under the **GNU Lesser General Public License v3.0 (LGPL-3)**.

See [LICENSE](LICENSE) for the full license text.

---

## 💬 Support

### Community Support
- 📖 [Documentation](https://github.com/abbayosua/odoo-ai-assistant/wiki)
- 💬 [GitHub Discussions](https://github.com/abbayosua/odoo-ai-assistant/discussions)
- 🐛 [Issue Tracker](https://github.com/abbayosua/odoo-ai-assistant/issues)

### Commercial Support
For enterprise support, custom development, or training:
- 📧 Email: abbasiagian@gmail.com
- 💼 LinkedIn: [Abb Yosua](https://linkedin.com/in/abbayosua)

---

## 🙏 Acknowledgments

- [Odoo SA](https://www.odoo.com/) for the amazing ERP platform
- [OpenAI](https://openai.com/) for GPT models
- [Ollama](https://ollama.com/) for local AI capabilities
- [Anthropic](https://www.anthropic.com/) for Claude models

---

## ⭐ Star History

If you find this module useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=abbayosua/odoo-ai-assistant&type=Date)](https://star-history.com/#abbayosua/odoo-ai-assistant&Date)

---

<div align="center">

**Made with ❤️ by [Abb Yosua](https://github.com/abbayosua)**

[⬆ Back to Top](#-odoo-ai-assistant)

</div>
