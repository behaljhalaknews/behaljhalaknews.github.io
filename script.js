/* बहल झलक — Mobile Navigation */

document.addEventListener("DOMContentLoaded", function () {
    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".main-navigation");
    const categoryItem = document.querySelector(".has-submenu");
    const categoryButton = document.querySelector(".submenu-toggle");

    if (!menuButton || !navigation) return;

    function closeMenu() {
        navigation.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "मेन्यू खोलें");

        if (categoryItem) {
            categoryItem.classList.remove("is-open");
        }

        if (categoryButton) {
            categoryButton.setAttribute("aria-expanded", "false");
        }
    }

    menuButton.addEventListener("click", function () {
        const isOpen = navigation.classList.toggle("is-open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "मेन्यू बंद करें" : "मेन्यू खोलें"
        );
    });

    if (categoryButton && categoryItem) {
        categoryButton.addEventListener("click", function (event) {
            event.preventDefault();

            const isOpen = categoryItem.classList.toggle("is-open");
            categoryButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    navigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    document.addEventListener("click", function (event) {
        if (
            window.innerWidth <= 768 &&
            navigation.classList.contains("is-open") &&
            !navigation.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeMenu();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            navigation.classList.remove("is-open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "मेन्यू खोलें");

            if (categoryItem) categoryItem.classList.remove("is-open");
            if (categoryButton) categoryButton.setAttribute("aria-expanded", "false");
        }
    });
});
