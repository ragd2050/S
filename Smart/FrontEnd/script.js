// ===============================
// SmartAgro - Frontend Script
// ===============================

// 🔗 عنوان الباك اند (FastAPI)
const BACKEND_URL = "http://127.0.0.1:8000";
// ===============================
// Simple API helpers for Dashboard
// ===============================

// جلب النباتات من الباك إند
window.apiGetPlants = async function () {
  const res = await fetch(`${BACKEND_URL}/api/plants`);
  if (!res.ok) {
    throw new Error("Failed to load plants from backend");
  }
  return await res.json();
};

// إضافة نبات جديد للباك إند
window.apiAddPlant = async function (plant) {
  const res = await fetch(`${BACKEND_URL}/api/plants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(plant),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Backend error:", text);
    throw new Error("Failed to add plant");
  }
  return await res.json();
};

// جلب الأجهزة من الباك إند
window.apiGetDevices = async function () {
  const res = await fetch(`${BACKEND_URL}/api/devices`);
  if (!res.ok) {
    throw new Error("Failed to load devices from backend");
  }
  return await res.json();
};

// -------------------------------
// Helpers
// -------------------------------
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// حساب قوة الباسورد (نشغله في صفحة التسجيل)
function calculatePasswordStrength(password) {
  let strength = 0;

  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return { text: "Weak", class: "weak" };
  if (strength <= 3) return { text: "Medium", class: "medium" };
  return { text: "Strong", class: "strong" };
}

// إظهار / إخفاء الباسورد (يُستدعى من الـ HTML)
function togglePassword(inputId, iconElement) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    iconElement.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    input.type = "password";
    iconElement.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

// -------------------------------
// About / Contact (كل الصفحات)
// -------------------------------
function showAbout() {
  const aboutText = `🌱 About SmartAgro

SmartAgro is an innovative agricultural platform that combines cutting-edge AI technology with smart sensors to help you manage your plants efficiently.

Our Mission:
To revolutionize home gardening and agriculture through intelligent monitoring and data-driven insights.

Features:
• Real-time temperature and humidity monitoring
• AI-powered plant health analysis
• Smart irrigation recommendations
• Disease detection and prevention
• Growth tracking and analytics

We believe in sustainable agriculture and empowering every farmer and gardener with the tools they need to succeed.

Join us in building a greener future! 🌿`;

  alert(aboutText);
}

function showContact() {
  const contactInfo = `📞 Contact SmartAgro

We'd love to hear from you!

📧 Email: rmbanat@dah.edu.sa
📱 Phone: +966 12 630 3333

🏢 Address:
Dar Al-Hekma University
Jeddah, Saudi Arabia

For technical support, partnerships, or general inquiries, please reach out to us.

🌱 Growing together towards a sustainable future!`;

  alert(contactInfo);
}

// -------------------------------
// DOMContentLoaded (نربط الأحداث)
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  let isSubmitting = false;

  // ========== Newsletter في index ==========
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const emailInput = document.getElementById("newsletter-email");
      const errorDiv = document.getElementById("newsletter-error");
      const email = emailInput.value.trim();

      errorDiv.textContent = "";

      if (!email) {
        errorDiv.textContent = "Email is required";
        return;
      }
      if (!validateEmail(email)) {
        errorDiv.textContent =
          "Please enter a valid email format (example@domain.com)";
        return;
      }

      const successMsg = document.createElement("div");
      successMsg.className = "success-message";
      successMsg.textContent =
        "✓ Thank you for subscribing! Check your email for confirmation. 🌱";

      newsletterForm.insertBefore(successMsg, newsletterForm.firstChild);
      newsletterForm.reset();

      setTimeout(() => successMsg.remove(), 4000);
    });
  }

  // ========== حركة التبديل بين Sign In / Sign Up ==========
  const signUpButton = document.getElementById("signUp");
  const signInButton = document.getElementById("signIn");
  const container = document.getElementById("container");

  if (signUpButton && signInButton && container) {
    signUpButton.addEventListener("click", () => {
      container.classList.add("right-panel-active");
    });

    signInButton.addEventListener("click", () => {
      container.classList.remove("right-panel-active");
    });
  }

  // ==========================
  // SIGN IN (يتصل بالباك اند)
  // ==========================
  const signinForm = document.getElementById("signinForm");
  if (signinForm) {
    const signinEmailInput = document.getElementById("signin_email");
    const signinPasswordInput = document.getElementById("signin_password");
    const signinPasswordError = document.getElementById("signin-password-error");
    const rememberMe = document.getElementById("remember-me");

    // email blur validation
    if (signinEmailInput) {
      signinEmailInput.addEventListener("blur", function () {
        const errorDiv = this.nextElementSibling;
        if (this.value && !validateEmail(this.value)) {
          errorDiv.textContent = "Invalid email format";
          this.style.borderColor = "#dc3545";
        } else {
          errorDiv.textContent = "";
          this.style.borderColor = "transparent";
        }
      });

      signinEmailInput.addEventListener("focus", function () {
        this.style.borderColor = "transparent";
        const errorDiv = this.nextElementSibling;
        if (errorDiv) errorDiv.textContent = "";
      });
    }

    signinForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      const email = signinEmailInput.value.trim();
      const password = signinPasswordInput.value;

      // clear errors
      signinForm
        .querySelectorAll(".red-text")
        .forEach((el) => (el.textContent = ""));

      let hasError = false;

      if (!email) {
        signinEmailInput.nextElementSibling.textContent = "Email is required";
        hasError = true;
      } else if (!validateEmail(email)) {
        signinEmailInput.nextElementSibling.textContent =
          "Please enter a valid email format (example@domain.com)";
        hasError = true;
      }

      if (!password) {
        signinPasswordError.textContent = "Password is required";
        hasError = true;
      } else if (password.length < 3) {
        signinPasswordError.textContent =
          "Password must be at least 3 characters";
        hasError = true;
      }

      if (hasError) return;

      isSubmitting = true;
      const submitBtn = document.getElementById("signin-btn");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in...";

      try {
        // 🔥 الاتصال بالباك اند (عدّل المسار لو API مختلفة)
        const payload = { email, password };

        const resp = await fetch(`${BACKEND_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          if (resp.status === 404) {
            signinPasswordError.textContent =
              "Backend not found (404). Make sure FastAPI is running on 127.0.0.1:8000.";
          } else {
            let errData = null;
            try {
              errData = await resp.json();
            } catch (e) {}
            signinPasswordError.textContent =
              errData?.detail ||
              "Invalid email or password. Please try again.";
          }
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          isSubmitting = false;
          return;
        }

        const data = await resp.json();

        // ندعم شكلين للريسبونس:
        // 1) { status: "success", message: "...", token: "...", name: "..." }
        // 2) { success: true, name: "...", token: "..." }
        const isSuccess = data.success === true || data.status === "success";

        if (isSuccess) {
          // نحاول نأخذ الاسم من الباك اند، ولو ما فيه نطلّعه من الإيميل
          let displayName = data.name;
          if (!displayName || typeof displayName !== "string") {
            displayName = email ? email.split("@")[0] : "User";
          }

          // حفظ بيانات المستخدم
          const userData = {
            name: displayName,
            email: email,
          };

          try {
            if (rememberMe && rememberMe.checked) {
              localStorage.setItem("userData", JSON.stringify(userData));
            } else {
              sessionStorage.setItem("userData", JSON.stringify(userData));
            }
            if (data.token) {
              localStorage.setItem("smartagro_token", data.token);
            }
          } catch (e) {
            console.warn("Could not save user data:", e);
          }

          alert("Login successful ✅");

          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          isSubmitting = false;

          // تحويل لصفحة welcome
          window.location.href = "welcome.html";
        } else {
          const msg =
            data.message || "Invalid email or password. Please try again.";
          signinPasswordError.textContent = msg;
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          isSubmitting = false;
        }
      } catch (err) {
        console.error("Login error:", err);
        signinPasswordError.textContent =
          "Cannot connect to backend. Make sure the server is running.";
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        isSubmitting = false;
      }
    });
  }

  // ==========================
  // SIGN UP (فرونت إند فقط + حفظ الاسم)
  // ==========================
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    const signupEmailInput = document.getElementById("signup_email");
    const passwordInput = document.getElementById("signup_password");
    const passwordError = document.getElementById("password-error");
    const passwordStrengthDiv = document.getElementById("password-strength");

    // email validation
    if (signupEmailInput) {
      signupEmailInput.addEventListener("blur", function () {
        const errorDiv = this.nextElementSibling;
        if (this.value && !validateEmail(this.value)) {
          errorDiv.textContent = "Invalid email format";
          this.style.borderColor = "#dc3545";
        } else {
          errorDiv.textContent = "";
          this.style.borderColor = "transparent";
        }
      });

      signupEmailInput.addEventListener("focus", function () {
        this.style.borderColor = "transparent";
        const errorDiv = this.nextElementSibling;
        if (errorDiv) errorDiv.textContent = "";
      });
    }

    // password strength
    if (passwordInput && passwordStrengthDiv) {
      passwordInput.addEventListener("input", function () {
        const strength = calculatePasswordStrength(this.value);
        if (!this.value) {
          passwordStrengthDiv.textContent = "";
          passwordStrengthDiv.className = "password-strength";
        } else {
          passwordStrengthDiv.textContent = `Password Strength: ${strength.text}`;
          passwordStrengthDiv.className = `password-strength ${strength.class}`;
        }
      });
    }

    // submit signup
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      const usernameInput = signupForm.querySelector('input[name="username"]');
      const username = usernameInput ? usernameInput.value.trim() : "";
      const email = signupEmailInput.value.trim();
      const password = passwordInput.value;

      signupForm.querySelectorAll(".red-text").forEach((el) => {
        el.textContent = "";
        el.style.color = "#dc3545";
      });

      let hasError = false;

      if (!username) {
        usernameInput.nextElementSibling.textContent = "Username is required";
        hasError = true;
      } else if (username.length < 3) {
        usernameInput.nextElementSibling.textContent =
          "Username must be at least 3 characters";
        hasError = true;
      }

      if (!email) {
        signupEmailInput.nextElementSibling.textContent = "Email is required";
      } else if (!validateEmail(email)) {
        signupEmailInput.nextElementSibling.textContent =
          "Please enter a valid email format (example@domain.com)";
        hasError = true;
      }

      if (!password) {
        passwordError.textContent = "Password is required";
        hasError = true;
      } else if (password.length < 6) {
        passwordError.textContent =
          "Password must be at least 6 characters";
        hasError = true;
      }

      if (hasError) return;

      isSubmitting = true;
      const submitBtn = document.getElementById("signup-btn");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Account...";

      setTimeout(() => {
        // نحفظ بيانات المستخدم بنفس شكل تسجيل الدخول
        const userData = {
          name: username,
          email: email,
        };
        try {
          localStorage.setItem("userData", JSON.stringify(userData));
        } catch (e) {
          console.warn("Could not save userData on signup:", e);
        }

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        isSubmitting = false;

        // نودّي المستخدم لصفحة الـ Welcome
        window.location.href = "welcome.html";
      }, 800);
    });
  }

  // ==========================
  // تعبئة اسم المستخدم في welcome / dashboard + الدائرة
  // ==========================
  const storedUser =
    sessionStorage.getItem("userData") || localStorage.getItem("userData");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const name = parsed.name || "User";

      // كل مكان فيه class="user-name"
      document.querySelectorAll(".user-name").forEach((el) => {
        el.textContent = name;
      });

      // دائرة الهيدر (RB)
      const userIcon = document.getElementById("userIcon");
      if (userIcon && typeof name === "string" && name.length > 0) {
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        userIcon.textContent = initials;
      }

      // لو فيه دائرة ثانية باسم مختلف (احتياط)
      const userCircle = document.getElementById("userCircle");
      if (userCircle && typeof name === "string" && name.length > 0) {
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        userCircle.textContent = initials;
      }
    } catch (e) {
      console.warn("Could not parse stored userData:", e);
    }
  }

  // ==========================
  // Dropdown في welcome/dashboard
  // ==========================
  const userIconEl = document.getElementById("userIcon");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (userIconEl && dropdownMenu) {
    userIconEl.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== userIconEl) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  // ==========================
  // التاريخ في welcome
  // ==========================
  const currentDateElement = document.getElementById("currentDate");
  if (currentDateElement) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    currentDateElement.textContent =
      new Date().toLocaleDateString("en-US", options);
  }
});

// Console message
console.log(
  "%cSmartAgro frontend loaded.",
  "color:#16a34a; font-weight:bold; font-size:14px;"
);