async function fetchBuyers() {  
    const response = await fetch('http://localhost:3000/api/buyers');  
    const buyersData = await response.json();  
    const designsContainer = document.getElementById('designs');  

    designsContainer.innerHTML = ''; // پاک کردن قبلی‌ها  

    buyersData.forEach(design => {  
        const designCard = `  
            <div class="col-md-4">  
                <div class="card">  
                    <div class="card-body">  
                        <h5 class="card-title">${design.name}</h5>  
                        <p>قیمت: ${design.price} تومان</p>  
                        <p>تاریخ: ${design.date}</p>  
                        <p>طراح: ${design.designer}</p>  
                        <p>دسته‌بندی: ${design.category}</p>  
                        <button class="btn btn-primary">خرید</button>  
                    </div>  
                </div>  
            </div>  
        `;  
        designsContainer.innerHTML += designCard; // اضافه کردن کارت‌ها  
    });  
}  

document.addEventListener('DOMContentLoaded', fetchBuyers);