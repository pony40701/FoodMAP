window.initLoginModal = function() {
  var loginBtn = document.querySelector('.btn-login');
  var modal = document.getElementById('loginModal');
  var closeBtn = modal ? modal.querySelector('.close') : null;
  var loginForm = document.getElementById('loginForm');

  // 綁定登入按鈕
  if (loginBtn && modal) {
    loginBtn.onclick = function(e) {
      e.preventDefault();
      if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'userCenter.html';
      } else {
        modal.style.display = 'block';
      }
    };
  }
  // 關閉按鈕
  if (closeBtn) {
    closeBtn.onclick = function() { modal.style.display = 'none'; };
  }
  // 點擊 modal 外部關閉
  if (modal) {
    modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
  }
  // 登入表單送出
  if (loginForm) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      var email = document.getElementById('email').value;
      
      // 儲存登入狀態
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      // 儲存用戶資料
      const userData = {
        email: email,
        name: email.split('@')[0] // 使用郵箱前綴作為預設名稱
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      modal.style.display = 'none';
      window.location.href = 'userCenter.html';
    };
  }
};

// 社交登入（可自訂）
function socialLogin(platform) {
  alert('尚未開放 ' + platform + ' 登入');
} 