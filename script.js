$(document).ready(function() {
    const reminderAudio = $('#reminder-audio')[0]; // Get the audio element

    // Request notification permission from the user
    function requestNotificationPermission() {
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                } else if (permission === "denied") {
                    console.log("Notification permission denied.");
                }
            });
        } else if (Notification.permission === "granted") {
            console.log("Notification permission already granted.");
        } else {
            console.log("Notification permission already denied.");
        }
    }

    requestNotificationPermission(); // Call this function to request permission

    // Check if the page is visible or not
    function isPageHidden() {
        return document.hidden;
    }

    // Function to stop the reminder audio
    function stopReminderAudio() {
        reminderAudio.pause();
        reminderAudio.currentTime = 0; // Reset audio to the beginning
    }

    // Function to play the reminder audio
    function playReminderAudio() {
        reminderAudio.play();
    }

    // Function to show the modal
    function showModal(reminderText) {
        $('#modal-reminder-text').text(reminderText); // Set the reminder text in the modal
        $('#reminderModal').show(); // Show the modal
        playReminderAudio(); // Play the audio when the modal is shown
    }

    // Function to hide the modal
    function hideModal() {
        $('#reminderModal').hide(); // Hide the modal
    }

    // Function to check if reminders are due
    function checkReminders() {
        $('#reminder-list li').each(function() {
            const reminderTime = $(this).data('time');
            const reminderText = $(this).data('text');
            const currentTime = new Date().getTime(); // Get current time in milliseconds

            // Trigger the reminder only if the current time is equal or greater than the reminder time
            if (currentTime >= reminderTime) {
                // Play the reminder sound
                playReminderAudio();

                // Check if the page is in focus or not
                if (isPageHidden()) {
                    // If the page is not in focus, show a browser notification
                    if (Notification.permission === "granted") {
                        const notification = new Notification(`Reminder: ${reminderText}`, {
                            body: "Click to stop the sound.",
                            icon: "path/to/icon.png" // Optional: replace with your custom icon path
                        });

                        // When the notification is clicked, stop the audio
                        notification.onclick = function() {
                            stopReminderAudio();
                            window.focus(); // Bring the browser window to the front
                        };
                    }
                } else {
                    // If the page is in focus, stop the audio and show the modal
                    stopReminderAudio();
                    showModal(reminderText);
                }

                $(this).remove(); // Remove the reminder from the list after notification
            }
        });
    }

    // Add reminder
    $('#add-reminder-btn').click(function() {
        const reminderText = $('#reminder-text').val();
        const reminderTime = new Date($('#reminder-time').val()).getTime(); // Convert time to milliseconds
        const currentTime = new Date().getTime(); // Current time in milliseconds

        // Ensure the reminder time is in the future
        if (reminderText === "" || isNaN(reminderTime)) {
            alert('Please enter a valid reminder and time.');
            return;
        } else if (reminderTime <= currentTime) {
            alert('Reminder time must be in the future.');
            return;
        }

        // Create reminder item and append it to the list
        const reminderItem = $('<li></li>').text(reminderText);
        reminderItem.append('<button class="remove-btn">Remove</button>');
        reminderItem.data('time', reminderTime);
        reminderItem.data('text', reminderText);

        $('#reminder-list').append(reminderItem);

        // Clear the input fields
        $('#reminder-text').val('');
        $('#reminder-time').val('');
    });

    // Remove individual reminder
    $(document).on('click', '.remove-btn', function() {
        $(this).parent().remove();
    });

    // Reset reminders
    $('#reset-reminders-btn').click(function() {
        // Clear all reminders from the list
        $('#reminder-list').empty();

        // Stop and reset the audio if it's playing
        stopReminderAudio();
    });

    // Handle modal buttons
    $('#modal-ok-btn').click(function() {
        hideModal(); // Hide the modal
    });

    $('#modal-cancel-btn').click(function() {
        stopReminderAudio(); // Stop the audio
        hideModal(); // Hide the modal
    });

    // Close the modal when the "x" is clicked
    $('.close').click(function() {
        hideModal(); // Hide the modal
    });

    // Check reminders every second
    setInterval(checkReminders, 1000);
});