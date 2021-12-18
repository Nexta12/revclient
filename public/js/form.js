const checkEye = document.querySelectorAll(".icon");
const Password = document.querySelectorAll(".password");

checkEye.forEach((check) => {
  check.addEventListener("click", openPassword);
});

function openPassword() {
  Password.forEach((pass) => {
    if (pass.type === "password") {
      pass.type = "text";
    } else {
      pass.type = "password";
    }
  });
}
