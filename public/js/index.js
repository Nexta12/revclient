
const deleBtn = document.querySelectorAll(".deletConfirm");
const profileImage = document.querySelectorAll(".profileImage");
const imageUpload = document.querySelectorAll(".imageUploadBtn");
const propType = document.querySelectorAll(".typeOfpro");
const searchBox = document.querySelectorAll(".search-box");



// delete confirmation

for (let i = 0; i < deleBtn.length; i++) {
  deleBtn[i].addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "question",
      iconColor: "#d33",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleBtn[i].nextElementSibling.click();
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  });
}

// profile image manager

// Image upload manager
profileImage.forEach((profile) => {
  profile.addEventListener("click", () => {
    imageUpload.forEach((image) => {
      image.click();
    });
  });
});

for (let i = 0; i < imageUpload.length; i++) {
  imageUpload[i].addEventListener("change", () => {
    const [file] = imageUpload[i].files;
    if (file) {
      for (let k = 0; k < profileImage.length; k++) {
        profileImage[k].src = URL.createObjectURL(file);
      }
    }
  });
}

// toggler form input
for (let j = 0; j < propType.length; j++) {
  propType[j].addEventListener("click", () => {
    if (propType[j].options.selectedIndex === 1) {
      let eel = document.querySelectorAll(".houseT");
      for (let i = 0; i < eel.length; i++) {
        eel[i].classList.toggle("activ");
      }
    } else if (
      propType[j].options.selectedIndex === 2 ||
      propType[j].options.selectedIndex === 4
    ) {
      let duplT = document.querySelectorAll(".duplT");
      for (let i = 0; i < duplT.length; i++) {
        duplT[i].classList.toggle("activ");
      }
    } else if (propType[j].options.selectedIndex === 3) {
      let flatT = document.querySelectorAll(".flatT");
      for (let i = 0; i < flatT.length; i++) {
        flatT[i].classList.toggle("activ");
      }
    }
  });
}

// table search and filter

searchBox.forEach((box) => {
  box.addEventListener("keyup", () => {

    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search-box");
    filter = input.value.toLowerCase().trim();
    table = document.querySelectorAll(".table");
    table.forEach(tab=>{
       tr = tab.getElementsByTagName("tr")

       for (let i = 0; i < tr.length; i++) {
         td = tr[i].getElementsByTagName("td")[1];

         if (td) {
           txtValue = td.textContent || td.innerText;
           if (txtValue.toLowerCase().trim().indexOf(filter) > -1) {
             tr[i].style.display = "";
           } else {
             tr[i].style.display = "none";
           }
         }
       }

    })
   
  });
});

    function getBal(){
  // declare variables
  let amtpd = document.getElementById('amtpd');
     if(amtpd != null){
    amtpd.addEventListener("mouseout", ()=>{
      let pdValue = amtpd.value
      let plValue = document.getElementById("plotp").value
      let npValue = document.getElementById("n_plots").value;
      let balance = document.getElementById("balance");
      let total = document.getElementById("total");
      if(pdValue != 0){
        total.innerText = ` Total:  ${(plValue * npValue).toLocaleString()} `;
        balance.innerText = ` Balance:  ${(
          plValue * npValue -
          pdValue
        ).toLocaleString()} `;
      }
    })
   }

  }getBal()

    function getstat(){
  // declare variables
  let amtpdT = document.getElementById('amtpdT');
    if(amtpdT != null){
      amtpdT.addEventListener("mouseout", () => {
        let pdValueT = amtpdT.value;
        let plValueT = document.getElementById("plotpT").value;
        let npValueT = document.getElementById("n_plotsT").value;
        let balanceT = document.getElementById("balanceT");
        let totalT = document.getElementById("totalT");
        if(pdValueT != 0){
        totalT.innerText = ` Total:  ${(plValueT * npValueT).toLocaleString()} `;
         balanceT.innerText = ` Balance:  ${( plValueT * npValueT - pdValueT).toLocaleString()} `;

        }
        
      });
    }

     }getstat()

