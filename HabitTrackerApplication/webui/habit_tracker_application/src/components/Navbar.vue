<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar navbar-expand-lg  ">
    <div class="container1">
      <div class="titleApp">
        <i class="bi bi-check logo"></i>
        <h4>Habit Tracker Application</h4>
      </div>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <i class="bi bi-check2-square"></i>
            <router-link class="nav-link" to="/">Habits</router-link>
          </li>
          <li class="nav-item ">
            <i class="bi bi-bar-chart"></i>
            <router-link class="nav-link" to="/stats"> Statistics</router-link>
          </li>
        </ul>
      </div>
      <div id="theme-icons" class="navbar-icons">
        <i id="theme" class="bi bi-moon"></i>
      </div>
    </div>
  </nav>
</template>

<script>
import '../style.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default {
  name: 'NavbarView',

};
</script>
