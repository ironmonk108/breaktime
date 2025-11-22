## Version 13.03

Added BreakTime to the Game so that it can be accessed via a Macro

Added a key binding to toggle away status

Fixed issue with count down timer not showing

Added Polish translation, Thank you Jakub and Lioheart

## Version 13.02

Fixing some additional v13 compatibility issues

## Version 13.01

v13 Compatibility

## Version 12.03

Fixed issue with the break time start sound playing when player re-opens the breaktime window

Fixed issue with the break time start sound playing when the player re-loads the page

Fixed permission error that was preventing the break time window from showing when auto start time was turned on

Fixed clamped warning

Fixed Foundry issue not being able to populate the playlist dynamically

Set the seconds count down to start 5 minutes until the end instead of 2 minutes.

Fixed issue with the break time start sound not stopping when a player closes the window.

## Version 12.02

Fixing an issue with a const variable

## Version 12.01

v12 Compatibility

Fixed spacing issues with user with realy long names

Added the option to automatically start the timer when Breaktime is opened

Added handlebar support for messages

Changed the breaktime icon to be less confusing with the wall icon

Added a button to clear all remaining time

## Version 11.03

Fixing issue with multiple breaktime icons appearing on the player list.

## Version 11.02

Fixed breaktime display when characters have really really long character names.

Added the option to play a playlist during the break, while pausing any currently playing tracks.  This replaces the option to loop the sound effect played when breaktime is started.

Added an option to play a sound effect when the break is finished.

Integrated with Monk's Sound Enhancements to control the volume of the sound played when a break is started or when the break time is up.

Fixed issues with displaying the correct time in the count down.

## Version 11.01

Added the option to have the break time sound on repeat while the app is visible.

Fixed issue when displaying chat bubbles with tokens that have no linked actors.

## Version 10.03

Fixed the footer button height when the breaktime window is popped out.

Added the option to have multiple different away messages separated by a semicolon that will be picked randomly.

Fixed issues where the toolbar was not updating properly for players.  And you had to click twice to get it to display properly.

Added chat bubble feature so away messages can come from your token.

Updated to be compliant with the latest version of Chat Commander

## Version 10.02

Updated the styling so it's a little more obvious that you cn click on the avatar to come back, and right click to leave.

Fixing issues clearing your personal away status if you return while breaktime app is displayed.

Fixed issue with remaining time is still displaying when the dialog is opened a second time after the time has already expired.

Fixed issue with players seeing the set remaining time button.

Fixed issue with allowing players to click on their own avatar.

Updated to show seconds when there's less than two minutes left.

Added the option to set the default ammount of time to use for remaining time countdown.

## Version 10.01

Adding a sound effect for when break time is opened to warn players that break has started.

Added the option to set when the game will resume, and how much time is left.

Changed the breaktime window so you have to specify if you are away, otherwise it will leave you in an undefined state.

Integrated with the individual away settings, so if you go away on a break, and breatime is started, then it will automatically set you to away.

Added the option to set how you want to inform people you are taking a break.  Instead of just a chat message, you can change it to a notification, both or none.

Fixed issue where the tooltip on the Token menu bar didn't update when you changed states.

## Version 1.0.15

Adding support for v10

## Version 1.0.14

Added the time that the break started at the top of the dialog.

Added the option for the GM to click on a player avatar to change their away status

Updated the the players listing to display the breaktime button for players when the Dialog is open.  Just in case the player closes the dialog they can now reopen it.

Added japanese language support.  thank you Brother Sharp!

## Version 1.0.12

Adding support for v9

Changed the images to grayscale if the player is away and changed the red border to gray.  Red was kind of giving the impression that something was wrong, and there wasn't anything wrong, they player was just not active.

Hotkeys are now being handled by Foundry, as such... I can return the shift space functionality without causing issues.  All this is editable so iyou can change the keys depending on what suits you best.

## Version 1.0.11

Added option to turn Shift Space back on.

## Version 1.0.10

Rebuilt the app, the interface should refresh properly and keep track of the players that are away a little better.  Second app I created so there was a lot I could do better.

Changed the styling for away and back, so instead of relying on text, there's now a big red and green band on the left side so you can check easily who's back.  As well as adding a check for those players that have returned.

Added option to customize the away and back messages.

Added the option to add a specific away message when using the chat command.

Added button to the player display to activate break time so you don't have to relay on the hotkey.

## Version 1.0.9

Added support for lib DF Hotkeys so that you can customize what key will activate breaktime.  Unfortunately this means you can no longer use shift space as the space key is a bit of a protected key.  I've changed it to Shift-Home.  Hopefully this isn't a huge transition.  And was kind of needed to extract it from being so closely linked to pausing the game.

Which leads into the next change, you can not set if you want breaktime to automatically set the game pause.  And pausing and unpasing can work while still waiting for people to return.  So you can continue to do things while breaktime is active.

## Version 1.0.7
Adding support for 0.8.x

## Version 1.0.6
Added support for chat commands
