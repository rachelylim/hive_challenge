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


// CLIENT //

if (Meteor.isClient) {
  Session.set('activeConvo', 'Everyone');

  Meteor.subscribe('users');
  Meteor.subscribe('messages');

  Template.SideMenu.helpers({
    users: function() {
      return Meteor.users.find();
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
  // 
};

// SERVER //

if (Meteor.isServer) {
  Meteor.publish('users', function() {
    return Meteor.users.find({}, {profile: 1});
  });

  Meteor.publish('messages', function(){
    return Messages.find({}, {sort: {timestamp: 1}});
  });
  
};
