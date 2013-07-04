(function($, undefined ) {

    $(document).ready(function() {
        var csrf_token = $("input[name=csrfmiddlewaretoken]").val();
        $.ajaxPrefilter(function(options, originalOptions, xhr) {
            xhr.setRequestHeader('X-CSRFToken', csrf_token);
        });
    });

    /*
     * The Ember Application
     */
    App = Ember.Application.create({
        LOG_TRANSITIONS: true,
    });

    /*
     * Our datastore.
     * We are using DjangoTastypieAdapter from:
     * https://github.com/toastdriven/django-tastypie
     */
    App.Store = DS.Store.extend({
        revision: 12,
        adapter: DS.DjangoTastypieAdapter.extend({
            namespace: (url_root + '/api/v1').replace(/^\//g, ''),
        }),
    });

    /*
     * Our Contact model
     */
    App.Contact = DS.Model.extend({
        name: DS.attr('string'),
        email: DS.attr('string'),
        gravatar: function() {
            var email = this.get('email').toLowerCase();
            if (!email) email = '';
            return 'http://www.gravatar.com/avatar/' + MD5(email) + '?d=identicon';
        }.property('email')
    });

    /*
     * Routes definition
     *
     * We should have something like this:
     *     /contacts
     *     /contacts/add
     *     /contacts/42
     *     /contacts/42/edit
     */
    App.Router.map(function() {
        this.resource('contacts', function() {
            this.route('add');
            this.route('show', { path: '/:contact_id' });
            this.route('edit', { path: '/:contact_id/edit' });
        });
        this.route('about');
    });

    /*
     * Index route
     *
     * When the user is at the application root, he is redirected
     * to the Contacts list view.
     */
    App.IndexRoute = Ember.Route.extend({
        redirect: function() {
            this.replaceWith('contacts');
        }
    });

    /*
     * Contacts list
     */
    App.ContactsRoute = Ember.Route.extend({
        model: function() {
            return App.Contact.find();
        },
    });
    App.ContactsController = Ember.ArrayController.extend({
        sortProperties: ['name'],
        sortAscending: true,
    });


    /*
     * Add a new contact
     */
    App.ContactsAddRoute = Ember.Route.extend({
        model: function() {
            return null;
        },
        setupController: function(controller, model) {
            controller.startEditing();
        },
        deactivate: function() {
            this.controllerFor('contacts.add').stopEditing();
        },
    });
    App.ContactsAddController = Ember.ObjectController.extend({
        headerTitle: 'Create',
        buttonTitle: 'Create',
        canDelete: false,
        startEditing: function() {
            this.transaction = this.get('store').transaction();
            this.set('content', this.transaction.createRecord(App.Contact, {}));
        },
        stopEditing: function() {
            if(this.transaction) {
                this.transaction.rollback();
                this.transaction = undefined;
            }
        },
        save: function() {
            this.transaction.commit();
            this.transaction = undefined;
            this.get('content').on('didCreate', this, function() {
                // TODO: broken in the current Ember release
                // https://github.com/emberjs/data/issues/405
                this.transitionToRoute('contacts.show', this.get('content'));
            });
        },
        cancel: function() {
            this.stopEditing();
            this.transitionToRoute('contacts.index');
        },
    });

    /*
     * Show an existing Contact.
     */
    App.ContactsShowRoute = Ember.Route.extend({
        model: function(params) {
            return App.Contact.find(params.contact_id);
        },
        setupController: function(controller, model) {
            controller.set('content', model);
        },
    });
    App.ContactsShowController = Ember.ObjectController.extend({
        destroy: function() {
            this.content.deleteRecord();
            this.store.commit();
            this.get('content').on('didDelete', this, function() {
                this.transitionToRoute('contacts');
            });
        },
    });

    /*
     * Edit an existing Contact.
     */
    App.ContactsEditRoute = Ember.Route.extend({
        model: function(params) {
            return App.Contact.find(params.contact_id);
        },
        setupController: function(controller, model) {
            controller.set('content', model);
        },
        deactivate: function() {
            this.controllerFor('contacts.edit').stopEditing();
        },
    });
    App.ContactsEditController = Ember.ObjectController.extend({
        headerTitle: 'Edit',
        buttonTitle: 'Update',
        canDelete: true,
        save: function() {
            this.store.commit();
            this.get('content').on('didUpdate', this, function() {
                this.transitionToRoute('contacts.show', this.get('content'));
            });
            this.get('content').on('becameInvalid', this, function(contact) {
                // TODO
                // Server-side validation throw some errors, I don't know how
                // to handle them in Emberjs.
            });
        },
        cancel: function() {
            this.stopEditing();
            this.transitionToRoute('contacts.show', this.get('content'));
        },
        stopEditing: function() {
            if(this.content.get('isDirty')) {
                this.content.rollback();
            }
        },
        destroy: function() {
            this.content.deleteRecord();
            this.store.commit();
            this.get('content').on('didDelete', this, function() {
                this.transitionToRoute('contacts');
            });
        },
    });

    /*
     * Some helpers
     */
    Handlebars.registerHelper('mailto', function(field) {
        var address = this.get(field);
        if (address) {
            return new Handlebars.SafeString('<a href="mailto:' + address + '" />' + address + '</a>');
        }
    });
}(jQuery));
