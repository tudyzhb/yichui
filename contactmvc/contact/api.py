from tastypie.resources import ModelResource
from tastypie.authentication import SessionAuthentication
from tastypie.authorization import Authorization
from tastypie.validation import CleanedDataFormValidation
from tastypie.exceptions import Unauthorized

from .models import Contact
from .forms import ContactForm


class PerUserAuthorization(Authorization):
    def read_list(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

    def read_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def create_list(self, object_list, bundle):
        return object_list

    def create_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def update_list(self, object_list, bundle):
        for obj in object_list:
            if not obj.user == bundle.request.user:
                raise Unauthorized()
        return object_list

    def update_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def delete_list(self, object_list, bundle):
        for obj in object_list:
            if not obj.user == bundle.request.user:
                raise Unauthorized()
        return object_list

    def delete_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user



class ContactResource(ModelResource):
    class Meta:
        queryset = Contact.objects.all()
        always_return_data = True
        authentication = SessionAuthentication()
        authorization = PerUserAuthorization()
        #validation = CleanedDataFormValidation(form_class=ContactForm)

    def obj_create(self, bundle, **kwargs):
        return super(ContactResource, self).obj_create(bundle, user=bundle.request.user)


