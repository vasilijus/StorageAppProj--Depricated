
$(function(){
	// define the application
	var NoteKeeper = {};
	var pictureSource;
	var destinationType;
	var isPhoneGapReady = false;
	var picture = false;
	
	(function(app){

		var NoteLi = '<li>' +
			'<div><strong></strong><span style="visibility:;">ID</span><p>DETAIL</p></div>' +
			'<div><a href="#pgPreviewNote?Title=LINK" id="pgPreviewDetails"><img src="images/error.png" width="100px" height="100px"/></a></div>'+
			'<div><a href="#pgEditNote?Title=LINK" id="pgEditDetails">EDIT</a></div>' +
			'</li>';
		var NoteHdr = '<li data-role="list-divider">NoteHdr</li>';
		var noNote = '<li id="noNote">You have no notes</li>';

		var NotePre='<a href="#pgEditNote?Title=LINK" id="pgEditDetails"> <div><p>Edit</p></div> '+
					'<div id="notePreText"></a>'+	
			    		'<h3>DATE<br><br><span style="visibility:;">LINK</span></h3>'+
				    '</div>'+
				    '<div  id="notePreImg"><img class="centerImg" src="images/error.png"/></div>'+
					'<div  id="notePreDetails">'+
				    	'<strong>Details:</strong> DETAIL<br><br><strong>Tasks:</strong>TASK<br>'+
					'</div>';

		app.init = function(){
			
			FastClick.attach(document.body);
			app.Notesbindings();
			app.checkForNotesStorage();
			app.BindDevice();
			

			$('#alertboxok').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				var toPage = $('#alertboxok').data('topage');
				// show the page to display after ok is clicked
				$.mobile.changePage('#'+toPage, {transition: 'slide'});
			});

			$(document).on('click', '#sbItems a', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				var href = $(this).attr('href');
				$.mobile.changePage(href, {transition: 'slide'});
			});

		};

		app.Notesbindings = function(){

			$('#li-click-open').on('click', function() {
				e.preventDefault();
				e.stopImmediatePropagation();
				liSlideToggleFun();
			});

			$(document).on('click', '#pgNoteList #pgPreviewDetails', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				var href = $(this)[0].href.match(/\?.*$/)[0];
				var Title = href.replace(/^\?Title=/,'');
				$.mobile.changePage('#pgPreviewNote', {transition: 'slide'});
				app.previewNote(Title); // PREVIEW NOTE MISSING
			});

			$(document).on('click', '#pgNoteList #pgEditDetails', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				var href = $(this)[0].href.match(/\?.*$/)[0];
				var Title = href.replace(/^\?Title=/,'');
				$.mobile.changePage('#pgEditNote', {transition: 'slide'});
				app.editNote(Title);
			});

			$(document).on('pagebeforechange', function(e, data){
				var toPage = data.toPage[0].id;
				if(toPage == 'pgNote'){
					// restart the storage check
					app.checkForNotesStorage();
				}
			});

			// bind the back button of the list
			$('#pgNoteBack').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				// move to the add new record screen
				$.mobile.changePage('#pgMenu', {transition: 'slide'});
			});
			$('#pgNoteBackMap').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				// move to the add new record screen
				$.mobile.changePage('#pgMenu', {transition: 'slide'});
			});
			
			// click new on listing page
			$('#pgNoteNew').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				$('#pgAddNote').data('from', pgNote);
				// move to the add new record screen
				$.mobile.changePage('#pgAddNote', {transition: 'slide'});
			});
			
			// click back button of new record page
			$('#pgAddNoteBack').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				//which page are we coming from, if from sign in go back to it
				var pgFrom = $('#pgAddNote').data('from');
				switch (pgFrom) {
					case "pgSignIn":
					$.mobile.changePage('#pgSignIn', {transition: 'slide'});
					break;
					default:
					// go back to the listing screen
					$.mobile.changePage('#pgNote', {transition: 'slide'});
				}
			});
			$('#pgPreviewNoteBack').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				//which page are we coming from, if from sign in go back to it
				$.mobile.changePage('#pgNote', {transition: 'slide'});
			});
			//	=	=	DELETE BOX	=	=
			$('#msgboxyes').on('click', function(e){
				//console.log(arguments + " argumentYes");//11111111111111111111111111111111111111
				e.preventDefault();
				e.stopImmediatePropagation();
				var yesmethod = $('#msgboxyes').data('method');
				var yesid = $('#msgboxyes').data('id');
				app[yesmethod](yesid);
			});

			$('#msgboxno').on('click', function(e){
				//console.log(" argumentNo");//1111111111111111111111111111111111111111111111111111
				e.preventDefault();
				e.stopImmediatePropagation();
				var toPage = $('#msgboxno').data('topage');
				// show the page to display after a record is deleted
				$.mobile.changePage('#'+toPage, {transition: 'slide'});
			});
			//	=	=	=	=	=	=	=

			// click save button of new record
			$('#pgAddNoteSave').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				// save the Note
				var NoteRec;
				NoteRec = pgAddNoteGetRec();
				app.addNote(NoteRec);
				$.mobile.changePage('#pgNote', {transition: 'slide'});
			});
			
			// click back button of edit record page
			$('#pgEditNoteBack').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				// go back to the listing screen
				$.mobile.changePage('#pgNote', {transition: 'slide'});
			});
			
			// click update when editing a record
			$('#pgEditNoteUpdate').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				// save the Note
				var NoteRecNew;
				NoteRecNew = pgEditNoteGetRec();
				app.updateNote(NoteRecNew);
			});
			
			// click delete on edit page
			$('#pgEditNoteDelete').on('click', function(e){
				e.preventDefault();
				e.stopImmediatePropagation();
				var Title = $('#pgEditNoteTitle').val();
				console.log("Ln 186" + Title);
				Title = Title.replace(/-/g,' ');
				Title = Title.replace(/-/g,' ');
				$('#msgboxheader h1').text('Confirm Delete');
				$('#msgboxtitle').text(Title);
				$('#msgboxprompt').text('Are you sure that you want to delete this note?');
				$('#msgboxyes').data('method', 'deleteNote');
				Title = Title.replace(/ /g,'-');
				$('#msgboxyes').data('id', Title);
				$('#msgboxno').data('topage', 'pgEditNote');
				$.mobile.changePage('#msgbox', {transition: 'pop'});
			});
			//Camera events
			$('#catchImg').on('click', function(e) {
				e.preventDefault();
				var newShotMain;
				newShotMain = catchImage();
			});

			$('#takePhotoCamera').on('click', function(e) {
				e.preventDefault();
				var newShot;
				newShot = takePhotoCamera();
			});
			$('#takePhotoDrive').on('click', function(e) {
				e.preventDefault();
				var newShot;
				newShot = takePhotoDrive();
			});

			$('#takePhotoCamera2').on('click', function(e) {
				e.preventDefault();
				var newShot;
				newShot = takePhotoCamera();
			});
			$('#takePhotoDrive2').on('click', function(e) {
				e.preventDefault();
				var newShot;
				newShot = takePhotoDrive();
			});
			
			$('#googleMap').on('click', function() {
				var output = document.getElementById("out");
				if (!navigator.geolocation){
				    output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
				    return;
				}
				function success(position) {
					var latitude  = position.coords.latitude;
					var longitude = position.coords.longitude;
					var map = new google.maps.Map(document.getElementById('map'), {
						center: {lat: latitude, lng: longitude},
						zoom: 16,
						mapTypeId: 'roadmap'
			        });

			        // Create the search box and link it to the UI element.
			        var input = document.getElementById('map-input');
			        var searchBox = new google.maps.places.SearchBox(input);
			        //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			        // Bias the SearchBox results towards current map's viewport.
			        map.addListener('bounds_changed', function() {
						searchBox.setBounds(map.getBounds());
			        });

			        var markers = [];
			        // Listen for the event fired when the user selects a prediction and retrieve
			        // more details for that place.
			        searchBox.addListener('places_changed', function() {
						var places = searchBox.getPlaces();
						if (places.length == 0) {
							return;
						}
						// Clear out the old markers.
						markers.forEach(function(marker) {
							marker.setMap(null);
						});
						markers = [];
						// For each place, get the icon, name and location.
						var bounds = new google.maps.LatLngBounds();
						places.forEach(function(place) {
				            if (!place.geometry) {
				              console.log("Returned place contains no geometry");
				              return;
				            }
			            var icon = {
				              url: place.icon,
				              size: new google.maps.Size(71, 71),
				              origin: new google.maps.Point(0, 0),
				              anchor: new google.maps.Point(17, 34),
				              scaledSize: new google.maps.Size(25, 25)
			            };
			            // Create a marker for each place.
			            markers.push(new google.maps.Marker({
							map: map,
							icon: icon,
							title: place.name,
							position: place.geometry.location
			            }));
			            if (place.geometry.viewport) {
							// Only geocodes have viewport.
							bounds.union(place.geometry.viewport);
			            } else {
		              		bounds.extend(place.geometry.location);
			            }
					});
					map.fitBounds(bounds);
			        });
				}
				function error() {
					output.innerHTML = "Unable to retrieve your location";
				}
				//output.innerHTML = "<p>Locating…</p>";
				navigator.geolocation.getCurrentPosition(success, error);
			});
			$('#clearStorage').on('click', function() {
				var clear;
				clear = clearData();
			});
		};

	

	//get the record to be saved and put it in a record array
	function pgAddNoteGetRec(){
		//define the new record
		var NoteRec
		NoteRec = {};
		NoteRec.Title = $('#pgAddNoteTitle').val();
		NoteRec.Detail = $('#pgAddNoteDetail').val();
		NoteRec.Date = $('#pgAddNoteDate').val();
		if( $('#pgAddImageURLDest').val().length < 2 ){
			NoteRec.Image = 'images/error.png';
			console.log("No Imgae ln277");
		} else {
			NoteRec.Image = $('#pgAddImageURLDest').val();
			console.log("Yes Imgae ln277");
		}
		return NoteRec;
	}

	//get the record to be saved and put it in a record array
	function pgEditNoteGetRec(){
		//define the new record
		var NoteRec
		NoteRec = {};
		NoteRec.Title = $('#pgEditNoteTitle').val();
		NoteRec.Detail = $('#pgEditNoteDetail').val();
		NoteRec.Date = $('#pgEditNoteDate').val();
		if( $('#pgEditImageURLDest').val().length < 2 ){
			NoteRec.Image = 'images/error.png';
			console.log("No Imgae ln295");
		} else {
			NoteRec.Image = $('#pgEditImageURLDest').val();
			console.log("Yes Imgae ln295");
		}
		return NoteRec;
	}

	//clear the forms for new data entry
	function pgAddNoteClear(){
		$('#pgAddNoteTitle').val('');
		$('#pgAddNoteDetail').val('');
		$('#pgAddNoteDate').val('');
		$('#pgAddImageURLDest').val('');
	}

	//clear the forms for new data entry
	function pgEditNoteClear(){
		$('#pgEditNoteTitle').val('');
		$('#pgEditNoteDetail').val('');
		$('#pgEditNoteDate').val('');
		$('#pgEditImageURLDest').val('');
		$('#pgAddImageURLDest').val('');
	}

	//	CAMERA FUNCTIONS
	function takePhotoCamera() {
		//try to scale the photo to 640x480 	
		console.log("Entering takePhotoCamera");
		var cameraOptions = {
			sourceType : Camera.PictureSourceType.CAMERA,
			destinationType : navigator.camera.DestinationType.FILE_URI,
			saveToPhotoAlbum : true,
			targetWidth : 640,
			targetHeight : 480,
		};
		navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
		console.log("Leaving takePhotoCamera");
	}

	function catchImage() {
		//try to scale the photo to 640x480 	
		console.log("Entering takePhotoCamera");
		var cameraOptions = {
			sourceType : Camera.PictureSourceType.CAMERA,
			destinationType : navigator.camera.DestinationType.FILE_URI,
			saveToPhotoAlbum : true,
			targetWidth : 640,
			targetHeight : 480,
		};
		navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
		console.log("Leaving takePhotoCamera");
	}

	function takePhotoDrive() {
		console.log("Entering takePhotoDrive");
		var cameraOptions = {
			quality : 50,
			destinationType : Camera.DestinationType.FILE_URI,
			sourceType : Camera.PictureSourceType.PHOTOLIBRARY
		}
		navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
		console.log("Leaving takePhotoDrive");
	}

	function cameraSuccess(res) {
        console.log("Entering cameraSuccess");
        console.log("Line 273. Result: " + res);
        //navigator.notification.alert(res, null, "Camera", "Continue");
		$('#pgAddImageURLDest').val(res);
		$('#pgEditImageURLDest').val(res);
        console.log("Leaving cameraSuccess");
		picture = true;
		
    }
	function cameraError(errObj) {
        console.log("Entering cameraError");
        console.error(JSON.stringify(errObj));
        //navigator.notification.alert(JSON.stringify(errObj), null, "Camera Error", "Continue");
        console.log("Leaving cameraError");
    }

    function clearData() {
    	var answer = confirm("Are you sure you want to delete the entire data?")
    	if(answer == true) {
    		window.localStorage.clear();
    		alert("Youve emptied your data.");
    	} else {

    	}
	    function liSlideToggleFun(){
			var target = $(this).parent().children("#li-click-expand");
			$(target).slideToggle();
	    }
    }


	app.addNote = function(NoteRec){
		// get Note records.
		var NotesObj = app.getNotes();
		// define a record object to store the current details
		var Title = NoteRec.Title;
		Title = Title.replace(/ /g,'-');
		NotesObj[Title] = NoteRec;
		localStorage['notekeeper-notes'] = JSON.stringify(NotesObj);
		// clear the form fields
		pgAddNoteClear();
		//which page are we coming from, if from sign in go back to it
		var pgFrom = $('#pgAddNote').data('from');
		switch (pgFrom) {
			case "pgSignIn":
			$.mobile.changePage('#pgSignIn', {transition: 'slide'});
			break;
		}
	};

	app.editNote = function(Title){
		// get Note records.
		var NotesObj = app.getNotes();
		// lookup specific Note
		Title = Title.replace(/ /g,'-');
		var NoteRec = NotesObj[Title];
		$('#pgEditNote').data('url', Title);
		$('#pgEditNoteDelete').data('href', Title);
		$('#pgEditNoteTitle').attr('readonly', 'readonly');
		$('#pgEditNoteTitle').attr('data-clear-btn', 'false');
		$('#pgEditNoteTitle').val(NoteRec.Title);
		$('#pgEditNoteDetail').val(NoteRec.Detail);
		$('#pgEditNoteDate').val(NoteRec.Date);
		$('#pgEditImageURLDest').val(NoteRec.Image);
	};


	app.previewNote = function(Title){
		// get record.
		var NotesObj = app.getNotes();
		// lookup specific Note
		Title = Title.replace(/ /g,'-');
		var NoteRec = NotesObj[Title];
		$('#pgEditNote').data('url', Title);
		$('#pgEditNoteDelete').data('href', Title);
		$('#pgEditNoteTitle').attr('readonly', 'readonly');
		$('#pgEditNoteTitle').attr('data-clear-btn', 'false');
		$('#pgEditNoteTitle').val(NoteRec.Title);
		$('#pgEditNoteDetail').val(NoteRec.Detail);
		$('#pgEditNoteDate').val(NoteRec.Date);
		$('#pgEditImageURLDest').val(NoteRec.Image);

		var NoteRec = NotesObj[Title];
		console.log("Ln 436 -Title: " + NoteRec.Title + " " + NoteRec.Detail);
		var html = '';

		// console.log("data:image/png;base64,"NoteRec.Image, ); // Image type / Image byte code 
		html += NotePre.replace(/LINK/g, NoteRec.Title)
				.replace(/DATE/g, NoteRec.Date)
				.replace(/images\/error.png/g, "data:image/png;base64," + NoteRec.Image)
				.replace(/DETAIL/g,NoteRec.Detail);
		
		$('#pgPreviewNotecontent').html( html);
	};

	app.updateNote = function(NoteRecNew){
		// get Note records.
		var NotesObj = app.getNotes();
		// lookup specific Note
		var Title = NoteRecNew.Title;
		Title = Title.replace(/ /g,'-');
		var NoteRec = NotesObj[Title];
		// assign new values to read record
		NoteRec.Title = NoteRecNew.Title;
		NoteRec.Detail = NoteRecNew.Detail;
		NoteRec.Date = NoteRecNew.Date;
		NoteRec.Image = NoteRecNew.Image;

		NotesObj[Title] = NoteRec;
		localStorage['notekeeper-notes'] = JSON.stringify(NotesObj);
		// clear the form fields
		pgEditNoteClear();
		// show the page to display after a record is deleted
		$.mobile.changePage('#pgNote', {transition: 'slide'});
	};

	app.deleteNote = function(Title){
		// clear the set values// get the Note records from localStorage
		var NotesObj = app.getNotes();
		// delete selected Note
		delete NotesObj[Title];
		// write it back to localStorage
		localStorage['notekeeper-notes'] = JSON.stringify(NotesObj);
		// show the page to display after a record is deleted
		$.mobile.changePage('#pgNote', {transition: 'slide'});
	};

	app.getNotes = function(){
		// get Note records
		var NotesObj = localStorage['notekeeper-notes'];
		if (!NotesObj){
			NotesObj = {};
			localStorage['notekeeper-notes'] = JSON.stringify(NotesObj);
		} else {
			NotesObj = JSON.parse(NotesObj);
		}
		return NotesObj;
	};

	// Dashboard
	app.displayNotes = function(){
		// get Note records.
		var NotesObj = app.getNotes();
		// create an empty string to contain html
		var html = '',date;
		// make sure your iterators are properly scoped
		var n;
		// loop over notes
		for (n in NotesObj){
			var nLnk = n.replace(/-/g,' ');
			html += NoteLi
				.replace(/ID/g, nLnk + 
				" <p class='dateTime'>" + NotesObj[n].Date + "</h3>")
				.replace(/LINK/g,n)
				.replace(/DETAIL/g,NotesObj[n].Detail)
				.replace(/images\/error.png/g, "data:image/png;base64," +  NotesObj[n].Image) ;
		}
		$('#pgNoteList').html(NoteHdr + html ).listview('refresh');
	};

	app.checkForNotesStorage = function(){
		var NotesObj = app.getNotes();
		// are there existing Note records?
		if (!$.isEmptyObject(NotesObj)) {
			// yes there are. pass them off to be displayed
			app.displayNotes();
		} else {
			// nope, just show the placeholder
			$('#pgNoteList').html(NoteHdr + noNote).listview('refresh');
		}
	};

	app.BindDevice = function(){
		document.addEventListener('deviceready', app.onDeviceReady, false);
	};

	app.onDeviceReady = function(){
		pictureSource = navigator.camera.PictureSourceType;
		destinationType = navigator.camera.DestinationType;
		isPhoneGapReady = true;
	};


	app.init();
	})(NoteKeeper);
});
