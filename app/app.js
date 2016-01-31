Messages = new Mongo.Collection('messages');
Messages.allow({
  insert: function(userId, doc) {
    return !!userId;
  },

  update: function(userId, doc) {
    return false;
  },

  remove: function(userId, doc) {
    return false;
  }
})

Convos = new Mongo.Collection('conversations');
Convos.allow({
  insert: function(userId, doc) {
    return !!userId;
  },

  update: function(userId, doc) {
    return false;
  },

  remove: function(userId, doc) {
    return false;
  }
})

Meteor.users.allow({
  insert: function(userId, doc) {
    return !!userId;
  }
})

// CLIENT //

if (Meteor.isClient) {
  Session.set('activeConvo', 'Everyone');

  Meteor.subscribe('users');
  Meteor.subscribe('messages');
  Meteor.subscribe('conversations');

  Template.SideMenu.helpers({
    users: function() {
      return Meteor.users.find();
    },

    conversations: function() {
      return Convos.find();
    }
  });

  Template.MessageHistory.helpers({
    messages: function() {
      return Messages.find();
    },
  });

  Template.MessageInfo.helpers({

    prettyTimestamp: function(timestamp) {
      return moment(timestamp).calendar();
    }
  })

  Template.SendMessage.events({
    'submit form': function(event, template) {
      event.preventDefault();

      var form = template.find('form');
      var messageEl = template.find('[name=message]');
      var message = messageEl.value;
      var user = Meteor.user().profile.name;
      // console.log(message);

      Messages.insert({
        login: user,
        timestamp: new Date,
        message: message,
        room: Session.get('activeConvo')
      });

      form.reset();
    }
  })

  Template.LoiterRooms.helpers({
    activeConvo: function() {
      return Session.get('activeConvo');
    }
  })


  Template.SideMenu.events({
    'click [data-conversation-start]': function(event, template) {
      var person = this.profile.name;

      Convos.insert({with: person});
      Session.set('activeConvo', person);
    },

    'click [data-conversation]': function(event, template) {
      // debugger
      var person = this.with;

      Session.set('activeConvo', person);
    }
  }) 
};

// SERVER //

if (Meteor.isServer) {
  Meteor.publish('users', function() {
    return Meteor.users.find({}, {profile: 1});
  });

  Meteor.publish('messages', function(){
    return Messages.find({}, {sort: {timestamp: 1}});
  });

  Meteor.publish('conversations', function() {
    return Convos.find({}, {sort: {type: 1}});
  });
  
};
