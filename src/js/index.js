document.addEventListener("DOMContentLoaded", async () => {
    let url = "https://localhost:44353"
    let products = await GetProducts(url);
    let items = document.querySelector('.items');
    let token = "";
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

            }
            else {
                const text = await response.text();
                const data = JSON.parse(text);
                console.log("Відповідь сервера:", data);
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
})