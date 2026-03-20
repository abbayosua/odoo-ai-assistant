# Contributing to Odoo AI Assistant

First off, thank you for considering contributing to Odoo AI Assistant! It's people like you that make this project better.

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to abbasiagian@gmail.com.

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected**
- **Include screenshots or animated GIFs if possible**
- **Include your Odoo version and module version**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain the expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the coding style guidelines below
- Document new code based on the Documentation Styleguide
- End all files with a newline

## 🎨 Coding Style

### Python

We follow Odoo's coding guidelines and PEP 8:

```python
# Good
def generate_response(self, prompt, context=None):
    """Generate a response using the AI provider.
    
    :param prompt: The user prompt
    :param context: Optional context dictionary
    :return: Generated response string
    """
    if not prompt:
        return ''
    
    provider = self._get_provider()
    return provider.generate(prompt, context)

# Bad
def generateResponse(self,prompt,context=None):
    if prompt==None:
        return
    provider=self._getProvider()
    return provider.generate(prompt,context)
```

### JavaScript

We follow Odoo's JavaScript guidelines:

```javascript
// Good
export class AIChatWidget extends Component {
    static template = "ai_assistant.ChatWidget";
    
    setup() {
        this.state = useState({
            messages: [],
            isLoading: false,
        });
    }
    
    async sendMessage() {
        const message = this.state.inputText.trim();
        if (!message) return;
        
        this.state.isLoading = true;
        try {
            const result = await this.orm.call(...);
            this.state.messages.push(result);
        } finally {
            this.state.isLoading = false;
        }
    }
}
```

### XML Views

```xml
<!-- Good -->
<record id="view_ai_provider_form" model="ir.ui.view">
    <field name="name">ai.assistant.provider.form</field>
    <field name="model">ai.assistant.provider</field>
    <field name="arch" type="xml">
        <form string="AI Provider">
            <sheet>
                <group>
                    <field name="name"/>
                    <field name="provider_type"/>
                </group>
            </sheet>
        </form>
    </field>
</record>
```

## 📚 Documentation

- Use clear and concise language
- Include code examples where appropriate
- Update the README.md if needed
- Add docstrings to all public methods
- Update the CHANGELOG.md for notable changes

## 🔧 Development Setup

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

# Run linting
flake8 ai_assistant/
black ai_assistant/
```

## 🧪 Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage
- Test on multiple Odoo versions if possible

```python
# Example test
class TestAIProvider(TransactionCase):
    def setUp(self):
        super().setUp()
        self.provider = self.env['ai.assistant.provider'].create({
            'name': 'Test Provider',
            'provider_type': 'ollama',
            'base_url': 'http://localhost:11434',
            'model': 'llama3.2',
        })
    
    def test_provider_creation(self):
        self.assertEqual(self.provider.name, 'Test Provider')
        self.assertEqual(self.provider.state, 'configured')
```

## 📦 Release Process

1. Update CHANGELOG.md
2. Update version in __manifest__.py
3. Create a git tag
4. Push to GitHub
5. Create a GitHub release

## ❓ Questions?

Feel free to open an issue or reach out to abbasiagian@gmail.com.

---

Thank you for contributing! 🎉
