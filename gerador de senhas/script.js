const passwordInput = document.getElementById("password");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const lengthInput = document.getElementById("length");
const uppercaseInput = document.getElementById("uppercase");
const numbersInput = document.getElementById("numbers");
const symbolsInput = document.getElementById("symbols");

const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()_+{}[]<>?/";

function generatePassword() {
  let chars = lowercaseChars;

  if (uppercaseInput.checked) {
    chars += uppercaseChars;
  }

  if (numbersInput.checked) {
    chars += numberChars;
  }

  if (symbolsInput.checked) {
    chars += symbolChars;
  }

  const length = lengthInput.value;
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  passwordInput.value = password;
}

generateBtn.addEventListener("click", generatePassword);

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(passwordInput.value);
  alert("Senha copiada!");
});

generatePassword();