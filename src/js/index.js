document.addEventListener("DOMContentLoaded", async () => {
    let url = "https://localhost:44353"
    let products = await GetProducts(url);
    let items = document.querySelector('.items');
    let countProductInCart = document.querySelector('.countProductInCart');
    let carts = document.querySelector('.carts');

    let token = "";
    token = localStorage.getItem("token");

    let registerLogin = document.querySelector('.registerLogin');
    let loginForm = document.querySelector('#loginForm');

    await getProductsCount()
    async function GetProducts(url, page = 1) {
        try {
            const response = await fetch(url + `/Product/${page}`, {method: "GET"});
            const data = await response.json();
            return data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    async function CreateProducts(products, url) {
        items.innerHTML = "";
        products.forEach(item => {
            let mainItem = document.createElement("div");
            mainItem.className = "item";

            let aImg = document.createElement("a");

            let img = document.createElement("img");
            img.className = "imgMain";
            img.src = url + item.imgPatch;

            img.onerror = function () {
                this.src = "/assets/Img/notFoundImages.png";
            };

            aImg.appendChild(img);
            mainItem.appendChild(aImg);

            let information = document.createElement("div");
            information.className = "information";

            let aText = document.createElement("a");
            aText.innerText = item.name;
            information.appendChild(aText);

            let pay = document.createElement("div");
            pay.className = "pay";

            let priceText = document.createElement("div");
            priceText.className = "text";
            priceText.innerText = item.price + "₴";
            pay.appendChild(priceText);

            let divImg = document.createElement("div");
            let imgPayProduct = document.createElement("img");
            imgPayProduct.src = "/assets/Img/inCart.png";
            imgPayProduct.className = "imgPay";

            imgPayProduct.dataset.id = item.id;

            divImg.appendChild(imgPayProduct);
            pay.appendChild(divImg);

            information.appendChild(pay);
            mainItem.appendChild(information);

            items.appendChild(mainItem);
        })
    }
        await CreateProducts(products, url);


    async function getProductsCount() {
        try {
            const response = await fetch(url + "/api/Order/count", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (response.status == 200) {
                let data = await response.json();
                countProductInCart.innerText = data.count;
            }
            if (response.status == 204) {
                countProductInCart.innerText = 0;
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async function AddInCart(url, token, productId, count = 1) {
        try {
            const response = await fetch(url + "/api/OrderProduct", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    productId: productId,
                    count: count
                })
            });

            if (response.status === 401 || response.status === 403) {
                registerLogin.style.display = "flex";
            }
            else if(response.ok || response.status === 201) {
                await getProductsCount()
            }
        } catch (err) {
            console.error(err);
        }
    }

    document.querySelectorAll(".imgPay").forEach(imgPay => {
        imgPay.addEventListener("click", async (event) => {
            const productId = event.currentTarget.dataset.id;
            await AddInCart(url, token, productId);
        });
    });

    async function login(gmail, password) {
        try {
            const res = await fetch(url + "/api/Auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: gmail, password: password })
            });

            if (res.ok) {
                const data = await res.json();
                token = data.token;
                localStorage.setItem("token", data.token);
                registerLogin.style.display = "none";
                await getProductsCount()
            } else {
                const errorData = await res.json();
                console.log("Eror:", res.status, errorData);
            }
        } catch (err) {
            console.log("Error:", err);
        }
    }

    async function loginRegister(gmail, password) {
        try {
            let res = await fetch(url + "/api/Auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"email": gmail, "password": password})
            })
            if(res.status === 400) {
                const errorData = await res.json();
                if(errorData.errors[0] === `Username '${gmail}' is already taken.`){
                    await login(gmail, password);
                }
            }
            else if(res.ok) {
                const data = await res.json();
                token = data.token;
                localStorage.setItem("token", data.token);
                registerLogin.style.display = "none";
                await getProductsCount()
            }
        }
        catch (e) {
            console.log(e);
        }
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let username = loginForm.querySelector('input[name="email"]').value;
        let password = loginForm.querySelector('input[name="password"]').value;
        await loginRegister(username, password);
        console.log("Отправлено");
    });



    async function GenerateCart(){
        try{
            let res = await fetch(url + "/api/OrderProduct", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (res.ok) {
                carts.innerHTML = ""
                let data = await res.json();
                data.oredersProducts.forEach(item => {
                    let cart = document.createElement("div");
                    cart.classList.add("cart");
                    cart.dataset.id = item.product.productId;

                    let divImg = document.createElement("div");
                    let img = document.createElement("img");
                    img.src = url + item.product.imgPath;

                    img.onerror = function () {
                        this.src = "/assets/Img/notFoundImages.png";
                    };
                    divImg.appendChild(img);
                    cart.appendChild(divImg);

                    let description = document.createElement("div");
                    description.classList.add("description");
                    description.innerText = item.product.productName;
                    cart.appendChild(description);

                    let counter = document.createElement("div");
                    counter.classList.add("counter");

                    let minus = document.createElement("button");
                    minus.innerText = "-";
                    minus.classList.add("minus");

                    counter.appendChild(minus);

                    let input = document.createElement("input");
                    input.type = "number";
                    input.value = item.count;
                    input.classList.add("count");
                    input.min = 1;
                    input.dataset.id = item.product.productId;

                    counter.appendChild(input);

                    let plus = document.createElement("button");
                    plus.innerText = "+";
                    plus.classList.add("plus");
                    counter.appendChild(plus);
                    cart.appendChild(counter);

                    let price = document.createElement("div");
                    price.classList.add("money");
                    price.innerText = (item.price * item.count) + "₴"
                    cart.appendChild(price);

                    let deleteImg = document.createElement("img");
                    deleteImg.classList.add("delete");
                    deleteImg.src = "/assets/Img/delete.png";
                    deleteImg.dataset.id = item.product.productId;

                    cart.appendChild(deleteImg);

                    carts.appendChild(cart);

                })
                let payDiv = document.querySelector(".payDiv");
                if (payDiv) {
                    payDiv.innerHTML = "";
                }
                else {
                    payDiv = document.createElement("div");
                    payDiv.classList.add("payDiv");
                }

                let butonPay = document.createElement("button");
                butonPay.classList.add("payAll");
                butonPay.innerText = data.totalPrice + "$ Замовити";
                payDiv.appendChild(butonPay);
                carts.after(payDiv);


                }
        }
        catch (error) {
            console.log(error);
        }
    }



    let cartBackground = document.querySelector('.cartBackground');
    let cartIcon = document.querySelector('.cartIcon');
    cartBackground.addEventListener('click', (e) => {
        if (e.target === cartBackground) {
            cartBackground.style.display = 'none';
        }
    })

    cartIcon.addEventListener('click', async function() {
        cartBackground.style.display = 'flex';
        await GenerateCart()
    })


    async function deleteCart(id){
        if(!Number(id)){
            return;
        }
        try{
            let res = await fetch(url + `/api/OrderProduct/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (res.ok) {
                const cartItem = document.querySelector(`.cart[data-id="${id}"]`);
                if (cartItem) cartItem.remove();

                let payAll = document.querySelector(".payAll");
                let data = await res.json();
                console.log(data.totalPrice)
                console.log(data)
                if (data.totalPrice == 0){
                    payAll.remove();
                }
                else {
                    payAll.innerText = data.totalPrice + "$ Замовити";
                }
                await getProductsCount()
            }
        }
        catch(error){
            console.log(error);
        }
    }

    document.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete')) {
            const productId = event.target.dataset.id;
            await deleteCart(productId)
        }

        // КНОПКА +
        const plus = event.target.closest(".plus");
        if (plus) {
            const counter = plus.closest(".counter");
            const input = counter.querySelector(".count");

            input.value = +input.value + 1;

            let price = counter.nextElementSibling;
            await updateProduct(input.dataset.id, input.value, input, price);

            return;
        }

        // КНОПКА -
        const minus = event.target.closest(".minus");
        if (minus) {
            const counter = minus.closest(".counter");
            const input = counter.querySelector(".count");

            const min = +input.min || 1;
            input.value = Math.max(+input.value - 1, min);

            let price = counter.nextElementSibling;
            await updateProduct(input.dataset.id, input.value, input, price);

            return;
        }
    });
    document.addEventListener("input", async (event) => {
        const input = event.target.closest(".count");
        if (!input) return;

        const min = +input.min || 1;

        // если пользователь ввёл меньше min → ставим min
        if (+input.value < min) input.value = min;

        let counter = input.closest(".counter");
        let price = counter.nextElementSibling;
        await updateProduct(input.dataset.id, input.value, input, price);
    });

    async function updateProduct(productId, count, input, price){
        try{
            let res = await fetch(url + `/api/OrderProduct`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"productId": productId, "count": count})
            })
            if (res.ok) {
                let data = await res.json();
                data = data.product
                let totalPrice = document.querySelector(".payAll")
                totalPrice.innerText = data.totalPrice + "₴ Замовити";
                input.value = data.count;
                price.innerText = (data.price * data.count) + "₴";
            }
            else {
                console.log("Недостатньо товару");
            }
        }
        catch(error){
            console.log(error);
        }
    }



    const paginationContainer = document.querySelector(".pagination"); // контейнер для кнопок

    function renderPagination(totalPages, currentPage = 1, maxButtons = 10) {
        paginationContainer.innerHTML = "";

        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        start = Math.max(1, end - maxButtons + 1);

        for (let i = start; i <= end; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.classList.add("page-btn");
            paginationContainer.appendChild(btn);

            // навешиваем обработчик сразу
            btn.addEventListener("click", async () => {
                currentPage = i;
                const products = await GetProducts(url, currentPage);
                await CreateProducts(products, url);
                renderPagination(totalPages, currentPage, maxButtons);
            });
        }
    }
    async function totalPage(){
        let response = await fetch(url + `/Product/page/count`, { method: "GET" });
        if (response.ok) {
            let data = await response.json();

            renderPagination(data.countPage)
        }

    }
    await totalPage();

    paginationContainer.addEventListener("click", async (e) => {
        if (e.target.tagName === "BUTTON") {
            const page = parseInt(e.target.textContent);
            const products = await GetProducts(url, page);
        }
    });
})