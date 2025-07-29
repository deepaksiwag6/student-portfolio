function submitFeedback() {
  const feedback = document.querySelector("textarea").value;
  if (feedback.trim() === "") {
    alert("Please write something before submitting.");
  } else {
    alert("Thanks for your feedback! (Firebase support coming soon.)");
    document.querySelector("textarea").value = "";
  }
}
