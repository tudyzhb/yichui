from django.db import models
from django.contrib.auth.models import User

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    user = models.ForeignKey(User)

    def __unicode__(self):
        return unicode(self.name)


