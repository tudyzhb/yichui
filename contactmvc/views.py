from django.views import generic


class HomePageView(generic.TemplateView):
    template_name = 'index.html'

home = HomePageView.as_view()

