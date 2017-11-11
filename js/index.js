var soundpack = [];
var soundIndex = [1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,8,8.5,9,9.5,10,11,11.5,12,12.5,13,13.5,14,15];
var notesData = [{num:3, time:105}, {num:3, time:223}, {num:4, time:331}, {num:5, time:482}, { num:5, time:565}, {num:4, time:673}, { num:3, time:782}, { num:2, time:893}, { num:1, time:1006}, {num:1, time:1113}, {num:2, time:1220}, {num:3, time:1337}, {num:3, time:1456}, {num:2, time:1623}, {num:2, time:1680}, {num:3, time:1883}, {num:3, time:1988}, {num:4, time:2107}, {num:5, time:2218}, {num:5, time:2337}, {num:4, time:2446}, {num:3, time:2555}, {num:2, time:2664}, {num:1, time:2771}, {num:1, time:2880}, {num:2, time:2992}, {num:3, time:3103}, {num:2, time:3220}, {num:1, time:3395}, {num:1, time:3449}];
var keys = [
      {num: 1, key: 90, type: "white"},
      {num: 1.5, key: 83, type: "black"},
      {num: 2, key: 88, type: "white"},
      {num: 2.5, key: 68, type: "black"},
      {num: 3, key: 67, type: "white"},
      {num: 4, key: 86, type: "white"},
      {num: 4.5, key: 71, type: "black"},
      {num: 5, key: 66, type: "white"},
      {num: 5.5, key: 72, type: "black"},
      {num: 6, key: 78, type: "white"},
      {num: 6.5, key: 74, type: "black"},
      {num: 7, key: 77, type: "white"},
      {num: 8, key: 81, type: "white"},
      {num: 8.5, key: 50, type: "black"},
      {num: 9, key: 87, type: "white"},
      {num: 9.5, key: 51, type: "black"},
      {num: 10, key: 69, type: "white"},
      {num: 11, key: 82, type: "white"},
      {num: 11.5, key: 53, type: "black"},
      {num: 12, key: 84, type: "white"},
      {num: 12.5, key: 54, type: "black"},
      {num: 13, key: 89, type: "white"},
      {num: 13.5, key: 55, type: "black"},
      {num: 14, key: 85, type: "white"},
      {num: 15, key: 73, type: "white"}
    ];

for(var i = 0; i < soundIndex.length; i++) {
  soundpack.push({
    number: soundIndex[i],
    url: "src/" + soundIndex[i] + ".mp3"
  });
}

var vm = new Vue({
  el: "#app",
  data: {
    sounddata: soundpack,
    notes: notesData,
    nowNoteId: 0,
    nextNoteId: 0,
    playingTime: 0,
    player: null,  // 播放用的 set timeout 計時物件
    displayKeys: keys,
    nowPressKey: -1,
    recordTime: 0,
    recorder: null
  },
  methods: {
    playnote: function(id, volume) {
      if(id > 0) {
        var audioObj = $("audio[data-num='" + id + "']")[0]; // 加 '' 讓選擇器認得小數點
        audioObj.currentTime = 0; // 倒帶：可連續播放
        audioObj.volume = volume;
        audioObj.play();
      }
    },
    playnext: function(volume) {
      var playNote = this.notes[this.nowNoteId].num;
      this.playnote(playNote, volume);
      this.nowNoteId += 1;
      
      if (this.nowNoteId >= this.notes.length) {
        this.stopplay();
      }
    },
    startplay: function() {
      this.nowNoteId = 0;
      this.playingTime = 0;
      this.nextNoteId = 0;
      
      var vObj = this;
      this.player = setInterval(function() {
        if (vObj.playingTime >= vObj.notes[vObj.nextNoteId].time) {
          vObj.playnext(1);
          vObj.nextNoteId++;
        }
          vObj.playingTime += 1;

        if (vObj.nowNoteId >= vObj.notes.length) {
          vObj.stopplay();
        }
        
      }, 2);
    },
    stopplay: function() {
      clearInterval(this.player);
      this.nowNoteId = 0;
      this.playingTime = 0;
      this.nextNoteId = 0;
    },
    // 傳入音符id，看現在是否正在播放它，有的回傳true，沒有回傳false
    getCurrentHighlight: function(id, skey) {
      if (this.notes.length == 0) {
        return false
      }
      if (this.nowPressKey == skey) {
        return true
      }
        
      var currentId = this.nowNoteId - 1;
      //如果 currentId < 0 會發生錯誤，所以要歸零
      if (currentId < 0) {
        currentId = 0; 
      }
      
      var num = this.notes[currentId].num;
      if (num == id) {
        return true
      }
      return false
    },
    startRecord: function() {
      this.recordTime = 0;
      this.recorder = setInterval(function() {
        vm.recordTime++;
      })
    },
    stopRecord: function() {
      // 先清掉，再歸零
      clearInterval(this.recorder);
      this.recordTime = 0;
    },
    addnote: function(id){
      //如果正在錄音，就推一個音符資料(音符號碼 / 播放時間)進去樂譜
      if (this.recordTime > 0) {
        this.notes.push({num: id, time: this.recordTime});
      }
      this.playnote(id, 1);
    },
    loadSample: function() {
      var vObj = this;
      $.ajax({
        url: "https://awiclass.monoame.com/api/command.php?type=get&name=music_dodoro",
        success: function(res) {
          vObj.notes = JSON.parse(res);
        }
      });
    }
  }
})

$(window).keydown(function(e) {
  var key = e.which;
  // console.log(key);
  vm.nowPressKey = key;
  
  for (var i = 0; i < vm.displayKeys.length; i++) {
    if (key == vm.displayKeys[i].key) {
      vm.addnote(vm.displayKeys[i].num);
    }
  }
});

$(window).keyup(function() {
  vm.nowPressKey = -1;
});