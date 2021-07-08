 var info;
 var type;

//called once the page is loaded
 window.onload = function(e){
   $.ajax({
        url: "https://ipinfo.io/?token=9a9ba7ac631a53",
        type:'GET',
        dataType: 'json',
        success: function(response) {
            info = response.loc;
            document.getElementById('search').disabled = false;
        }
   });
 }

//Getting the location based on if h'here' is checked or 'location' is checked
function enable(){
  if(document.getElementById('here').checked == true)
 {
document.getElementById('location').disabled = true;
document.getElementById('location').value = "";
document.getElementById('location').placeholder = "location";
 }

 if(document.getElementById('loc').checked == true)
 {
   document.getElementById('location').disabled = false;
 }
}

function clear_it(){
  //clearing the result page on click of clear button
  document.getElementById('location').value = ''
  document.getElementById('keyword').value = ''
  document.getElementById('distance').value = ''
  document.getElementById("category").value = ''
  //setting category to default
  const default_option = document.getElementById("default_button")
  default_option.selected = true;
  //clearing eventdetails
  var el1 = document.getElementById("right")
  if(document.body.contains(el1)){
        document.getElementById("right").innerHTML = "";
  }

  var el2 = document.getElementById("left")
  if(document.body.contains(el2)){
        document.getElementById("left").innerHTML = "";
  }

  var el3 = document.getElementById("leftNo")
  if(document.body.contains(el3)){
        document.getElementById("leftNo").innerHTML = "";
  }
  
  //clearing eventlist
  var el4 = document.getElementById("events_list")
  if(document.body.contains(el4)){
        document.getElementById("events_list").innerHTML = "";
  }



  document.getElementById("center").innerHTML = "";
  document.getElementById("nothing").hidden = true;
  document.getElementById("noHr").hidden = true;
 }

function geoLocation() {
  document.getElementById("formTest").addEventListener("submit",event => {event.preventDefault();})
  document.getElementById('keyword').validity.valid

  //getting client location if here is checked
 if(document.getElementById('here').checked == true)
 {
   location_geo = info;
   type_of_button = "here"
 }

 //getting location value
 if(document.getElementById('loc').checked == true)
 {
  location_geo = document.getElementById("location").value
  type_of_button = "loc"
 }

 //getting other inputs
  keyword = document.getElementById("keyword").value
  category = document.getElementById("category").value
  distance = document.getElementById("distance").value
  if (distance == ''){
    distance = 10
  }
  const regex = new RegExp(/^[1-9][0-9]*$/)
  Regexvalue = (regex.test(distance))

  //checking if keyword ,location and checking decimal point for distance
  if ((keyword != "") && (location_geo != "") &&(Regexvalue==true || distance == ''))
  {  
    $.ajax({
    url: "/abc",
    type: "GET",
    contentType: 'application/json', 
    data: { 
      location:location_geo,
      key:keyword, 
      segment: category,
      button_type: type_of_button,
      distance : distance
    },
    success: function(response) {
  
      var mydata = JSON.parse(response)
      if (mydata.success == false)
      {
        document.getElementById("event_details").hidden = true;
        document.getElementById("nothing").hidden = false;
        document.getElementById("noHr").hidden = false;
        novalue = "<p id='nothing_p'> No Records have been found </p> <br>"
        document.getElementById("nothing").innerHTML = novalue
      }
      else
      {
        document.getElementById("event_details").hidden = true;
        document.getElementById("nothing").hidden = true;
        document.getElementById("noHr").hidden = true;
        text = "<table>"
        text += "<tr><th>Date</th><th>Icon</th><th>Event</th><th>Genre</th><th>Venue</th></tr>"
        var i;  
        for (i = 0; i < mydata.data.length; i++) {
          text += "<tr><td id='d"+i+"''style='width:220px;'>"+mydata.data[i].dates+"</td>    ";
          text += "<td id='l"+i+"''style='width:150px;'>"+"<img width='100' height='56' src='"+mydata.data[i].logo+"'>"+"</td>    ";
          text += "<td id='e"+i+"' style='width:550px;'><a href='#event_details'><p id = '"+mydata.data[i].id+"' onClick= 'eventDetails(this.id);'>"+mydata.data[i].event_name+"</p></a></td>    ";
          text += "<td id='g"+i+"'style='width:120px;'>"+mydata.data[i].genre+"</td>   ";
          text += "<td id='v"+i+"'' style='width:250px;'>"+mydata.data[i].venue+"</td></tr>";
        }
        text += "</table>"
   
      document.getElementById("events_list").innerHTML = text
      }
    },
    error: function(xhr) {
      //Do Something to handle error
      alert("xhr")
    }
  });
}
}
function eventDetails(id){
  document.getElementById("event_details").hidden = false;
  $.ajax({
  url: "/eventdetails",
  contentType: 'application/json',
  type: "GET", //send it through get method
  data: { 
    event_id:id
  },
   success: function(response) {
    //alert("success event details")
    var mydata = JSON.parse(response)

    display_center = "<h2>"+mydata.data.event_name+"</h2>"

    if(mydata.data.dates !="")
    {
      display = "<h3>Date</h3><p id='details'>"+mydata.data.dates+"</p>"
    }
      
    if (mydata.data.artist != "")
    {
      display += "<h3>Artist / Team</h3>"
    }
    if (mydata.data.artist != "")
    {
    display += "<p id='details'>"
      for (i = 0; i < mydata.data.artist.length; i++) {
      display += "<a href='"+mydata.data.artistURL[i]+"'target='_blank' >"+mydata.data.artist[i]+"</a>" 

      if (i < mydata.data.artist.length-1 && mydata.data.artist[i+1]!=''){
        
      display +=  "&nbsp;|&nbsp;"
      }    
   }
   display += "</p>"
 }

    if (mydata.data.venue != "")
    {
    display += "<h3>Venue</h3><p id='details'>"+mydata.data.venue+"</p>"
    }
     if (mydata.data.genre != "")
     {
    display += "<h3>Genre</h3><p id='details'>"+mydata.data.genre+"</p>"
     }
     if (mydata.data.price != "")
     {
    display += "<h3>Price Ranges</h3><p id='details'>"+mydata.data.price+"</p>"
     }
      if (mydata.data.status != "")
      {
    display += "<h3>Ticket Status</h3><p id='details'>"+mydata.data.status+"</p>"
     }
     if (mydata.data.buy !="")
     {
    display += "<h3>Buy Ticket At:</h3><p id='details'> <a href='"+mydata.data.buy+"' target='_blank'>Ticketmaster</a></p>"
     }


    if (mydata.data.seatmap != "") {
  
      var el = document.getElementById("leftNo")
      if(document.body.contains(el)){
        el.remove();
      }
      var node = document.createElement("div");
      node.setAttribute("id", "left");
      document.getElementById("event_details").appendChild(node); 

      var node1 = document.createElement("div");
      node1.setAttribute("id", "right");
      document.getElementById("event_details").appendChild(node1); 

      display_image = "<img width='500' height='400' src='"+mydata.data.seatmap+"'>"
      document.getElementById("right").innerHTML = display_image
      document.getElementById("left").innerHTML = display
    }
    else{
      var el = document.getElementById("left")
      if(document.body.contains(el)){
        el.remove();
      }
      var el1 = document.getElementById("right")
      if(document.body.contains(el1)){
        el1.remove();
      }

      var node = document.createElement("div");
      node.setAttribute("id", "leftNo");
      document.getElementById("event_details").appendChild(node);
      document.getElementById("leftNo").innerHTML = display
    }
    
    document.getElementById("center").innerHTML = display_center
  },
  error: function(xhr) {
    //Do Something to handle error
  }
});
}