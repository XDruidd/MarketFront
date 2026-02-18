document.addEventListener("DOMContentLoaded", async () => {
    let url = "https://localhost:44353"
    let products = await GetProducts(url);
    let items = document.querySelector('.items');
    let countProductInCart = document.querySelector('.countProductInCart');

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
})