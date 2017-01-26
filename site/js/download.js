$(document).ready(function() {
      
    $("#getLibrary").click(function(event){
      $("#library_div ul").empty()
       $.get("library", function(data){
        count = data.rowCount;
        for(i = 0; i<count; i++){
          name = data.rows[i]['orig_name'];
          file = data.rows[i]['filename'];

          $("#library_div ul").append("<li><a href=/serve/"+file+">"+name+"</a></li>");
          // console.log(name);  
        }
        
       });
        
        
    });
});
