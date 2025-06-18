document.addEventListener("DOMContentLoaded", function () {
  const openLoginLink = document.getElementById("merchant-login-link");
  const restaurantLoginModal = document.getElementById("restaurantLoginModal");

  // If the modal doesn't exist on the page, don't run the rest of the script
  if (!restaurantLoginModal) return;

  const restaurantLoginForm = document.getElementById("restaurantLoginForm");
  const closeButton = restaurantLoginModal.querySelector(".close");

  // --- Functions to control the modal ---
  function openRestaurantLoginModal(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    restaurantLoginModal.style.display = "block";
  }

  function closeRestaurantLoginModal() {
    restaurantLoginModal.style.display = "none";
  }

  // --- Event Listeners ---

  // 1. Open modal when the "商家登入" link is clicked
  if (openLoginLink) {
    openLoginLink.addEventListener("click", openRestaurantLoginModal);
  }

  // 2. Close modal using the 'x' button
  if (closeButton) {
    closeButton.addEventListener("click", closeRestaurantLoginModal);
  }

  // 3. Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === restaurantLoginModal) {
      closeRestaurantLoginModal();
    }
  });

  // 4. Prevent modal from closing when clicking inside the content
  const modalContent = restaurantLoginModal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  // 5. Handle form submission
  if (restaurantLoginForm) {
    restaurantLoginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("restaurant-email").value;
      const password = document.getElementById("restaurant-password").value;

      try {
        const response = await fetch("http://localhost:8080/api/merchants/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const result = await response.json();
          
          // 儲存 JWT token 和餐廳資訊
          localStorage.setItem("merchantToken", result.token);
          localStorage.setItem("merchantEmail", result.email);
          localStorage.setItem("restaurantId", result.restaurantId);
          
          alert("登入成功！歡迎回來～");
          closeRestaurantLoginModal();
          
          // 跳轉到商家後台
          window.location.href = "restaurant.html";
        } else {
          const errorData = await response.text();
          alert("登入失敗：" + errorData);
        }
      } catch (error) {
        console.error("登入請求失敗:", error);
        alert("登入失敗，請稍後再試。");
      }
    });
  }

  // --- Auto-open logic ---
  // Check if we need to auto-open the modal (e.g., after registration)
  if (sessionStorage.getItem("openRestaurantLogin") === "true") {
    sessionStorage.removeItem("openRestaurantLogin");
    openRestaurantLoginModal();
  }
});