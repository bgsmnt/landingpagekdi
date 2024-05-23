document.addEventListener('DOMContentLoaded', function () {
    var apiKey = 'YOUR_RAJAONGKIR_API_KEY';

    // Fetch provinces
    fetch(`https://pro.rajaongkir.com/api/province?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            var provinces = data.rajaongkir.results;
            var provinceSelect = document.getElementById('province');
            provinces.forEach(province => {
                var option = document.createElement('option');
                option.value = province.province_id;
                option.textContent = province.province;
                provinceSelect.appendChild(option);
            });
        });

    // Fetch cities when province is selected
    document.getElementById('province').addEventListener('change', function () {
        var provinceId = this.value;
        fetch(`https://pro.rajaongkir.com/api/province/city?province=${provinceId}&key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                var cities = data.rajaongkir.results;
                var citySelect = document.getElementById('city');
                citySelect.innerHTML = ''; // Clear previous options
                cities.forEach(city => {
                    var option = document.createElement('option');
                    option.value = city.city_id;
                    option.textContent = city.city_name;
                    citySelect.appendChild(option);
                });
            });
    });

    // Calculate shipping cost when city or courier is changed
    document.getElementById('city').addEventListener('change', calculateShippingCost);
    document.getElementById('courier').addEventListener('change', calculateShippingCost);

    function calculateShippingCost() {
        var cityId = document.getElementById('city').value;
        var courier = document.getElementById('courier').value;

        if (cityId && courier) {
            var weight = 1000; // Example weight in grams
            fetch(`https://pro.rajaongkir.com/api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'key': apiKey
                },
                body: JSON.stringify({
                    origin: 501, // Example origin city ID
                    destination: cityId,
                    weight: weight,
                    courier: courier
                })
            })
                .then(response => response.json())
                .then(data => {
                    var shippingCost = data.rajaongkir.results[0].costs[0].cost[0].value;
                    // Mengubah simbol mata uang dari dollar menjadi rupiah
                    document.getElementById('shipping-cost').innerText = 'Shipping: Rp' + (shippingCost * 14000).toFixed(0); // Kurs dolar ke rupiah adalah 1 USD = Rp 14.000 (misalnya)
                    var totalCost = productTotal + (shippingCost * 14000); // Mengonversi biaya pengiriman dari dolar ke rupiah
                    document.getElementById('total-cost').innerText = 'Total: Rp' + totalCost.toFixed(0); // Mengubah total biaya dari dollar menjadi rupiah

                });
        }
    }

    document.getElementById('checkout-form').addEventListener('submit', function (event) {
        event.preventDefault();

        var fullname = document.getElementById('fullname').value;
        var address = document.getElementById('address').value;
        var city = document.getElementById('city').options[document.getElementById('city').selectedIndex].text;
        var province = document.getElementById('province').options[document.getElementById('province').selectedIndex].text;
        var zip = document.getElementById('zip').value;
        var paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        var totalCost = document.getElementById('total-cost').innerText;

        var whatsappNumber = '6285157511027'; // Ganti dengan nomor WhatsApp yang diinginkan
        var message = `Order Details:%0A
Full Name: ${fullname}%0A
Address: ${address}%0A
City: ${city}%0A
Province: ${province}%0A
Zip Code: ${zip}%0A
Payment Method: ${paymentMethod}%0A
${totalCost}`;

        var whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}`;

        window.location.href = whatsappURL;
    });
});
