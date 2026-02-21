document.addEventListener('DOMContentLoaded', () => {
    const optionsMenu = document.querySelector('.app-navbar__menu');
    const btnSignUp = document.getElementById('app-btn-sign-up');
    const navbar = document.querySelector('.app-navbar');
    const userControls = document.querySelector('.app-navbar__controls');
    const container = document.querySelector('.app-navbar__container');
    const btnMenu = document.getElementById('app-btn-menu');

    if (!optionsMenu || !btnSignUp || !navbar || !userControls || !container || !btnMenu) return;

    const responsiveY = () => {
        if (window.innerHeight <= 362) {
            if (optionsMenu.classList.contains('show')) {
                optionsMenu.classList.add("min")
            } else {
                optionsMenu.classList.remove("min")
            }
        } else {
            optionsMenu.classList.remove("min")
        }
    }

    const responsive = () => {
        if (window.innerWidth <= 865) {
            if (optionsMenu && optionsMenu.children[0]) optionsMenu.children[0].appendChild(btnSignUp)
            if (navbar && optionsMenu) navbar.appendChild(optionsMenu);
        } else {
            if (userControls) userControls.appendChild(btnSignUp);
            if (container && optionsMenu) container.appendChild(optionsMenu);
        }
        responsiveY();
    }

    btnMenu.addEventListener('click', () => {
        optionsMenu.classList.toggle('show');
        responsiveY();
    });

    responsive();
    window.addEventListener("resize", responsive);
});
