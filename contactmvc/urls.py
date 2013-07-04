from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from tastypie.api import Api

from contactmvc.contact.api import ContactResource
from contactmvc.views import home


admin.autodiscover()

api = Api(api_name='v1')
api.register(ContactResource())

urlpatterns = patterns('',
    url(r'^$', login_required(home), name='home'),
    url(r'^login/$', 'django.contrib.auth.views.login',
        {'template_name': 'login.html'}, name='login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout',
        {'template_name':'logout.html'}, name='logout'),
    url(r'^api/', include(api.urls)),
    url(r'^admin/', include(admin.site.urls)),
)
