from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

handler500 = 'djangotoolbox.errorviews.server_error'

urlpatterns = patterns('',
    ('^_ah/warmup$', 'djangoappengine.views.warmup'),
    (r'^admin/', include(admin.site.urls)),
    ('^$', 'django.views.generic.simple.direct_to_template', {'template':'clock.html'}),
)