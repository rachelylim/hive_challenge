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

GlobalMessages = new Mongo.Collection('global');
GlobalMessages.allow({
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
  Meteor.subscribe('global');

  Template.SideMenu.helpers({
    users: function() {
      var user = Meteor.user().profile.name;
      return Meteor.users.find({profile: {$ne: {name: user}}});
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

      if(participants.includes("Everyone")) {
        GlobalMessages.insert({
          login: user,
          timestamp: new Date,
          message: message
        })
      } else {
        Messages.insert({
          login: user,
          timestamp: new Date,
          message: message,
          with: participants
        })
      }

      var height = 0

      $('.messages').each(function(i, value){
        height += parseInt($(this).height());
      });

      height += '';

      $('.chatbox').animate({scrollTop: height}, "slow");

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
        return GlobalMessages.find({}, {sort: {timestamp: 1}});
      } else {
        return Messages.find({with: participants}, {sort: {timestamp: 1}});
      }
    }
  })

  Template.SideMenu.events({
    'click [data-conversation]': function(event, template, doc) {
      var person = event.toElement.innerText;
      var users = $(".username").removeAttr('id');

      event.toElement.id = 'active'
      
      Session.set('activeConvo', person);
    }
  }) 
};

// SERVER //

if (Meteor.isServer) {
  Meteor.publish('users', function() {
    return Meteor.users.find({}, {profile: 1});
  });

  Meteor.publish('messages', function() {
    return Messages.find({}, {sort: {timestamp: 1}});
  });

  Meteor.publish('global', function() {
    return GlobalMessages.find({}, {sort: {timestamp: 1}});
  })
};


