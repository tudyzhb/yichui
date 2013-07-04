from django.forms import ModelForm

from .models import Contact


class ContactForm(ModelForm):
    def clean_email(self):
        return self.cleaned_data['email'].lower()

    class Meta:
        model = Contact
