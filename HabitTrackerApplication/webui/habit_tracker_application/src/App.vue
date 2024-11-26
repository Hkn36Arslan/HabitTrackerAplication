<!-- src/App.vue -->
<template>
  <div id="app">
    <Navbar />
    <div style="width: 100%;">
      <router-view style="width: 100%;" />
    </div>
  </div>
</template>

<script>

import Navbar from './components/Navbar.vue';
import './style.css';

export default {
  name: 'App',
  components: {
    Navbar,

  },
  mounted() {
    // Sayfa Yüklenince Tema Yükle
    const savedTheme = localStorage.getItem("theme") || "light";
    document.querySelector("html").setAttribute("data-theme", savedTheme);

    // İkonu Güncelleme
    const themeIcon = document.querySelector("#theme");
    themeIcon.classList.remove("bi-sun", "bi-moon");
    themeIcon.classList.add(savedTheme === "dark" ? "bi-sun" : "bi-moon");

    // Tema Geçiş Fonksiyonu
    document.querySelector("#theme-icons").addEventListener("click", function () {
      const currentTheme = document.querySelector("html").getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.querySelector("html").setAttribute("data-theme", newTheme);

      localStorage.setItem("theme", newTheme);

      // İkonu Güncelleme
      themeIcon.classList.remove("bi-sun", "bi-moon");
      themeIcon.classList.add(newTheme === "dark" ? "bi-sun" : "bi-moon");
    });
  }


};
</script>
