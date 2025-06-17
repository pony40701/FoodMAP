document.getElementById("restaurantLoginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // 阻止表單預設送出
  
    const email = document.getElementById("restaurant-email").value;
    const password = document.getElementById("restaurant-password").value;
  
    const loginData = {
      email: email,
      password: password
    };
  
    try {
      const response = await fetch("http://localhost:8080/api/merchants/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });
  
      if (response.ok) {
        const result = await response.json(); // 看你後端回傳格式
        alert("登入成功！歡迎回來～ 😎");
        // 你可以在這裡儲存 token 或導向頁面
        console.log(result);
      } else {
        const errorText = await response.text();
        alert("登入失敗：" + errorText);
      }
    } catch (error) {
      console.error("登入失敗", error);
      alert("登入失敗：" + error.message);
    }
  });