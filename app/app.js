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

GlobalMessages = [];

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
      var user = Meteor.user().profile.name;
      return Meteor.users.find({profile: {$ne: {name: user}}});
    },

    everyone: function() {
      return Convos.findOne({with: 'Everyone'})
    },

    conversations: function() {
      return Convos.find({with: {$ne: 'Everyone'}}, {sort: {with: 1}});
    }
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
      var person = Session.get('activeConvo');
      var participants = [person, user].sort();

      var newMessage = Messages.insert({
        login: user,
        timestamp: new Date,
        message: message,
        with: participants
      });

      if(participants.includes("Everyone")) {
        GlobalMessages.push(newMessage);
      }

      form.reset();
    }
  })

  Template.LoiterRooms.helpers({
    activeConvo: function() {
      return Session.get('activeConvo');
    },

    messages: function(data) {
      var user = Meteor.user().profile.name;
      var person = Session.get('activeConvo');
      var participants = [person, user].sort();
      
      if(participants.includes("Everyone")) {
        return GlobalMessages;
      } else {
        return Messages.find({with: participants}, {sort: {timestamp: 1}});
      }
    }
  })


  Template.SideMenu.events({
    'click [data-conversation-start]': function(event, template) {
      var person = this.profile.name;

      if(Convos.findOne({with: person})) {
        Session.set('activeConvo', person);  
      } else {
        Convos.insert({with: person});
        Session.set('activeConvo', person);
      }
    },

    'click [data-conversation]': function(event, template) {
      var person = this.with

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

// if (!Convos.findOne({with: "Everyone"})) {
//   Convos.insert({with: "Everyone"});
// }

// if (!Convos.findOne({with: "Will Mchale"})) {
//   Convos.insert({with: "Will Mchale"});
// }

// if (!Meteor.users.findOne({profile: {name: "Jessica Park"}})) {
//   Meteor.users.insert({profile: {name: "Jessica Park"}});
// }


