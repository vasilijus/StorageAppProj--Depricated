$(function(){
	// Some important aplication elements
	var listOrganiser = {};
	var pictureSource;
	var destinationType;
	var cordovaReady = false;
	
	(function(app) {
		// variable to be used in app
		var noteList = '<li><a href="#pageEditNotes?Title=LINK">ID</a></li>';
		var noteHeader = '<li data-role="list-divider">NoteHeader</li>';
		var noteNumber = '<li id="noteNumber">There are no notes</li>';
		
		
		app.init = function() {
			FastClick.attach(document.body);
			app.NotesBindings();
			app.checkForNotesStorage();
			app.BindDevice();
			// delete list item
			$('#msgBoxYes').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation(); // Keeps the rest of the handlers from being executed and prevents the event from bubbling up the DOM tree.
				var yesmethod = $('#msgBoxYes').data('method'); // Store arbitrary data associated with the matched elements or return the value at the named data store for the first element in the set of matched elements.
				var yesid = $('#msgBoxYes').data('id');
				app[yesmethod](yesid);
			});
			
			$('#msgBoxNo').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation(); 
				var toPage = $('#msgBoxNo').data('topage');
				//return back to the page 
				$.mobile.changePage('m' + toPage, { transition: 'slide' });
			});
			
			$('#alertBoxOk').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var toPage = $('#alertBoxOk').data('topage');
				// display the page after the alert
				$.mobile.changePage('#' + toPage, { transition: 'slide' });
			});
			//clicking the list items
			$(document).on('click', '#sbItems a', fnction(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var href = $(this).attr('href');
				$.mobile.changePage(href, { transition: 'slide' });
			});
		};
		
		app.NotesBindings = functrion() {
			$(document).on('click', '#pageNoteList a', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var href = $(this)[0].href.match(/\?.*$/)[0];
				var Title = href.replace(/^\?Title=/, '');
				$.mobile.changePage('#pageEditNotes', { transition: 'slide' });
				app.editNote(Title);
			});
			
			$(document).on('pageBeforeChange', function(e, data) {
				var toPage = data.toPage[0].id;
				if( toPage == 'pageNotes') {
					//restart the storage checking
					app.checkForNotesStorage();
				}
			});
			
			// Binding home page to the button 'Back'
			$('#pageNotesBack').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// Return to the previous screen
				$.mobile.changePage('#pageMenu', { transition: 'slide' });
			});
			
			// Forward the create new listing screen
			$('#pageNoteNew').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				$('#pageAddNotes').data('from', pageNotes);
				//move to the screen to create a new list item
				$.mobile.changePage('#pageAddNotes', { transition: 'slide' });
			});
			
			//bind the add new note button to the note list screen
			$('#pageAddNoteBack').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// switch statement to find out the previous screen page
				var pageFrom = $('#pageAddNotes').data('from');
				switch (pageFrom) {
					case "pageSignIn":
						$.mobile.changePage('#pageSignIn', { transition: 'slide' });
						break;
					default:
						// go back to the list page
						$.mobile.changePage('#pageNotes', { transition: 'slide' });
				}
			});
			
			$('#pageAddNoteSave').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// save a not to a variable
				togoRec = pageAddNoteGetRec();
				app.addNote(togoRec);
			});
			
			// click the button back in the update screen
			$('#pageEditNoteBack').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// get back to list item screen
				$.mobile.changePage('#pageNotes', { transition: 'slide' });
			});
			
			// update screen button click
			$('#pageEditNoteUpdate').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				// save the note
				var togoRecNew;
				togoRecNew = pageEditNoteGetRec();
				app.updateNote(togoRecNew);
			});
			
			// Deleting a note in the edit page.
			$('#pageEditNoteDelete').on('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var Title = $('#pageEditNoteTitle').val();
				Title = Title.replace(/-/g, ' ');
				Title = Title.replace(/-/g, ' ');
				$('#msgboxheader h1').text('Confirm Delete');
				$('#msgboxtitle').text(Title);
				$('#msgboxprompt').text('Are you sure that you want to delete this note?');
				$('#msgboxyes').data('method', 'deleteNote');
				Title = Title.replace(/ /g,'-');
				$('#msgboxyes').data('id', Title);
				$('#msgboxno').data('topage', 'pgEditNote');
				$.mobile.changePage('#msgbox', { transition: 'pop' });
			});
			
		};
		
		// save the details to an object and put in in a recored array
		function pageAddNoteGetRec() {
			// define a new record
			var togoRec = {};
			togoRec.Title =$('#pageAddNoteTitle').val();
			togoRec.Detail =$('#pageAddNoteDetail').val();
			togoRec.Date =$('#pageAddNoteDate').val();
			return togoRec;
		}
		
		// get the record and set the recored
		function pageEditNoteGetRec() {
			// define a new record
			togoRec.Title =$('#pageEditNoteTitle').val();
			togoRec.Detail =$('#pageEditNoteDetail').val();
			togoRec.Date =$('#pageEditNoteDate').val();
			return togoRec;
		};
		
		// Clear forms for new entries
		function pageAddNoteClear() {
			$('#pageAddNoteTitle').val('');
			$('#pageAddNoteDetail').val('');
		};
		function pageEditNoteClear() {
			$('#pgEditNoteTitle').val('');
			$('#pgEditNoteDetail').val('');
		};
		
		
		
		app.addNote = function(togoRec) {
			// get the record details
			var togoObj = app.getNotes();
			// set a record name Title for the new record
			var Title = togoRec.Title;
			Title = Title.replace(/ /g, '-');
			togoObj[Title] = togoRec;
			localStorage['togoList-notes'] = JSON.stringify(togoObj);
			// clear the form fields
			pageAddNoteClear();
			// send us to the previous page.
			var pageFrom = $('#pageAddNote').data('from');
			switch (pageFrom) {
				case "pageSignIn":
					$.mobile.changePage('#pageSignIn', { transition: 'slide' });
					break;
				default:
						// go back to the list page
						$.mobile.changePage('#pageNotes', { transition: 'slide' });
			}
		};
		
		app.editNote = function(Title) {
			// get record
			var togoObj = app.getNotes();
			// look for required item
			Title = Title.replace(/ /g, '-');
			var togoRec = togoObj[Title];
			$('#pageEditNote').data('url', Title);
			$('#pageEditNoteDelete').data('href', Title);
			$('#pageEditNoteTitle').attr('readonly', 'readonly');
			$('#pageEditNoteTitle').attr('data-clear-btn', 'false');
			$('#pageEditNoteTitle').val(togoRec.Title);
			$('#pageEditNoteDetail').val(togoRec.Details);
			$('#pageEditNoteDate').val(togoRec.Date);
			
		};
		
		app.updateNote = function(togoRecNew) {
			// get 
			var togoObj = app.getNotes();
			// lookup the chosen record
			var Title = togoRecNew.Title;
			Title = Title.replace(/ /g, '-');
			var togoRec = togoObj[Title];
			// assign new values to record
			togoRec.Title = togoRecNew.Title;
			togoRec.Detail = togoRecNew.Detail;
			togoRec.Date = togoRecNew.Date;
			togoObj[title] = togoRec;
			localStorage['togoList-notes'] = JSON.stingify(togoObj);
			// clear form
			pageEditNoteClear();
			// show the list screen page again
			$.mobile.changePage('#pageNote', { transition: 'slide' });
		}
		
		app.deleteNote = function(Title) {
			// get record from localStorage , clear the set values
			var togoObj = app.getNotes();
			// delete record
			delete togoObj[Title];
			// update localStorage
			localStorage['togoList-notes'] = JSON.stringify(togoObj);
			// send back to screen
			$.mobile.changePage('#pageNote', { transition: 'slide' });
		};
		
		app.getNotes = function() {
			// get record
			var togoObj = localStorage['togoList-notes'];
			if( !togpObj ) {
				togoObj = {};
				localStorage['togoList-notes'] = JSON.stringify(togoObj);
			} else {
				togoObj = JSON.parse(togoObj);
			}
			return togoObj;
		};
		
		app.displayNotes = function() {
			//get record
			var togoObj = app.getNotes();
			// empty string to store HTML
			var html = '';
			// a variable for an iterator
			var i;
			//loop throoug the records
			for (i in togoObj) {
				var iLnk = i.replace(/-/g, ' ');
				html += noteList.replace(/ID/g, iLnk).replace(/LINK/g, i);
			}
			$('#pageNoteList')html(noteHeader + html).listview('refresh');
		};
		
		app.checkForNotesStorage = function(){
			var togoObj = app.getNotes();
			// are there existing Note records?
			if (!$.isEmptyObject(togoObj)) {
				// yes there are. pass them off to be displayed
				app.displayNotes();
			} else {
				// nope, just show the placeholder
				$('#pageNoteList').html(noteHeader + noteNumber).listview('refresh');
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
		
	});
});