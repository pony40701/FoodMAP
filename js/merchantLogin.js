document.addEventListener("DOMContentLoaded", function () {
  console.log("商家登入腳本已載入");
  const openLoginLink = document.getElementById("merchant-login-link");
  const restaurantLoginModal = document.getElementById("restaurantLoginModal");

  // If the modal doesn't exist on the page, don't run the rest of the script
  if (!restaurantLoginModal) {
    console.log("找不到商家登入模態框，腳本停止執行");
    return;
  }

  const restaurantLoginForm = document.getElementById("restaurantLoginForm");
  const closeButton = restaurantLoginModal.querySelector(".close");

  // --- Functions to control the modal ---
  function openRestaurantLoginModal(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log("開啟商家登入模態框");
    restaurantLoginModal.style.display = "block";
  }

  function closeRestaurantLoginModal() {
    console.log("關閉商家登入模態框");
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
      console.log("提交商家登入表單");

      const email = document.getElementById("restaurant-email").value;
      const password = document.getElementById("restaurant-password").value;

      console.log("準備發送登入請求，email:", email);

      try {
        console.log("發送登入請求到後端");
        const response = await fetch("http://localhost:8080/api/merchants/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        console.log("登入請求回應狀態:", response.status);
        if (response.ok) {
          const result = await response.json();
          console.log("登入成功，獲取到的資料:", result);
          
          // 儲存 JWT token 和餐廳資訊
          localStorage.setItem("merchantToken", result.token);
          localStorage.setItem("merchantEmail", result.email);
          localStorage.setItem("restaurantId", result.restaurantId);
          
          console.log("已儲存登入資訊：", {
            token: result.token,
            email: result.email,
            restaurantId: result.restaurantId
          });
          
          alert("登入成功！歡迎回來～");
          closeRestaurantLoginModal();
          
          // 跳轉到商家後台
          console.log("準備跳轉到商家後台");
          window.location.href = "restaurant.html";
        } else {
          const errorData = await response.text();
          console.error("登入失敗:", errorData);
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
    console.log("檢測到自動開啟標記，開啟登入模態框");
    sessionStorage.removeItem("openRestaurantLogin");
    openRestaurantLoginModal();
  }
});