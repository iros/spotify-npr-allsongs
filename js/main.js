var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var views = sp.require('sp://import/scripts/api/views');
var player = models.player;

function init() {

  var Episode = Backbone.Model.extend({
    initialize : function(options) {
      this.songList = new SongList(this.get("song"));
    }
  });
  
  var EpisodeCollection = Backbone.Collection.extend({
    model : Episode,
    parse : function(data) {
      return data.list.story;
    },
    url : function() {
      return "http://api.npr.org/query?id=37&output=JSON&apiKey=[your key]&callback=?";
    }
  });
  
  var EpisodeView = Backbone.View.extend({
    model : Episode,
    template : "script#episode",
    initialize : function(options) {
      this.setElement( this.el );
      this.template = _.template($(this.template).html());
      this.songViews = [];
    },
    
    render : function() {
      // render episode info
      this.$el.html(this.template({ song : this.model }));
      var self = this;
      
      // render each song
      this.model.songList.each(function(song) {
        song.findTrack({
          success : function() {
            var songView = new SongView({ model : song });
            var songViewEl = songView.render().$el;
            
            
            self.$el.find('.songList').append(songViewEl);
            self.$el.find('.songList li[data-uri="' + songView.model.get('uri') + '"]').click(
               _.bind(songView.onClick, songView)
             ); 
             
            // pretty sure this needs to be a player. For now,
            // it just pulls the image and that's enough. Wasn't
            // sure how to get proper player behavior. Hence the click
            // collection above.
            var img = new views.Image(songView.model.get('image'));
            img.node.style.width = '128px';
            img.node.style.height = '128px';
            img.node.style.backgroundSize = 'cover';
            
            self.$el.find('.songList .imageContainer').append( img.node );         
          }
        })
      });
      return this;
    }
  });
  

  
  var Song = Backbone.Model.extend({
    buildQuery : function() {
      return "artist:" + this.get("artist").$text +
        " AND track:" + this.get("title").$text;
    },
    findTrack : function(options) {
      var search = new models.Search(this.buildQuery()),
          self = this;
      search.localResults = models.LOCALSEARCHRESULTS.APPEND;
 
      search.observe(models.EVENT.CHANGE, function() {
        if (search.tracks.length > 0) {
          self.found = true;
          self.set({"track" : search.tracks[0] });
          self.set({"album" : search.tracks[0].album });
          self.set({"uri" : search.tracks[0].data.uri });
          self.set({"image" : search.tracks[0].image  });
          options.success(self);
        }
      });
      search.appendNext();
    }
  });

  var SongView = Backbone.View.extend({
    template : 'script#songItem',
    
    events : {
      "click" : "onClick"
    },
    
    initialize : function() {
      this.template = _.template($(this.template).html());
    },
    
    render : function() {
      this.$el = this.template({ song : this.model.toJSON()});
      return this;  
    },
    
    onClick : function() {
      models.player.play(
        this.model.get("uri")
      );
      this.playing = true;
    }
  });

  var SongList = Backbone.Collection.extend({
    model : Song
  });
  
  var e = new EpisodeCollection();
  e.fetch({
    success : function() {
      var episodeView = new EpisodeView({ el :'.episodeInfo', model : e.models[0] });
      console.log(e.models);
      episodeView.render();
    }
  });
}

init();



