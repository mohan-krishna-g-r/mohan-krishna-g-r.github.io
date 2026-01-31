document.addEventListener("DOMContentLoaded", function () {
    AOS.init({
        duration: 1000, 
        once: false   
      });
    let projects = document.querySelector(".projects-grid");
    if (!projects) return;

  
    const project_data = [
      {
        img: "assets/projects/textsumm.png", // Fixed the path
        title: "TextSumm",
        year: "2024",
        tag_list: [
          "NLP",
          "FastAPI",
          "Transformer",
          "Docker",
          "Azure",
          "CI/CD",
          "GitHub Actions"
        ],
        description: `
          Developed an automated text summarization system using NLP techniques, processing over 5,64,562 records. 
          Fine-tuned transformer models to improve summarization accuracy by 300% for ROUGE-2 F1-score.
          Implemented FastAPI-based RESTful API supporting multiple file formats (txt, URLs, PDFs, DOCX).
          Built a fully automated CI/CD pipeline with GitHub Actions, Docker, and Azure.
        `,
        type: "0", // Multiple button options
        buttonList: [
          {
            label: "GitHub",
            type: "0", // Source-link button
            icon: "open_in_new",
            link: "https://github.com/MohanKrishnaGR/Infosys_Text-Summarization"
          }
        ]
      },
      {
        img: "assets/projects/pyro.png", // Ensure the image exists
        title: "PyroGuardian",
        year: "2024",
        tag_list: [
          "UAV",
          "Deep Learning",
          "Edge AI",
          "CUDA",
          "TensorRT",
          "AWS SNS",
          "Real-Time Streaming"
        ],
        description: `
      Developed an UAV for real-time fire detection and mission-critical operations. Optimized a Deep Learning model for fire severity classification, achieving a 90% speedup with TensorRT.  
      
      Integrated real-time video streaming over low-bandwidth networks, reducing downtime by 20%.  
      
      Implemented AWS SNS-based alerts for event-triggered notifications with RBAC. Leveraged NVIDIA Jetson Nano & CUDA for on-board inference, enabling AI-driven decision-making.
    `,
        type: "0", // Type 0 indicates multiple buttons
        buttonList: [
          {
            label: "GitHub",
            type: "0", // Source-link button
            icon: "open_in_new",
            link: "https://github.com/MohanKrishnaGR/PyroGuardian"
          },
          {
            label: "Technical Paper",
            type: "0",
            icon: "description",
            link: "https://example.com/pyroguardian-paper" // Replace with actual link
          }
        ]
      },
      {
        img: "assets/projects/image.png",  // Update with the correct image path if needed
        title: "Crop Schedule Management using Quantum Optimization Techniques",
        year: "2024",
        tag_list: [
          "Quantum Computing",
          "Quantum Annealing",
          "QUBO",
          "D-Wave",
          "Optimization"
        ],
        description: `
          Led the research team in designing a Quantum Optimizer at SREC and with guidance of CQuICC, IIT Madras.
          Addressed agricultural challenges by formulating a QUBO model with constraints (crop rotation, adjacency rules, maximum field utilization) and leveraging Quantum Annealing on a D-Wave computer to compute optimal planting schedules dynamically.
        `,
        type: "0", // Indicates multiple button options
        buttonList: [
          {
            label: "GitHub",
            type: "0", // Source-link button
            icon: "open_in_new",
            link: "https://github.com/YourTeamProjectLink" // Replace with the actual repository link
          }
        ]
      }      
    ];

    project_data.forEach(project => {
        let cardHTML = `
          <div class="project-card" data-aos="zoom-in">
            <img class="project-image" src="${project.img}" alt="${project.title}">
            <p class="title">${project.title}</p>
            <p class="year">${project.year}</p>
            <div class="tag-list">
        `;
    
        // Insert each tag into the tag list
        project.tag_list.forEach(tag => {
          cardHTML += `<span class="tag">${tag}</span>`;
        });
    
        cardHTML += `
            </div> <br>
            <hr>
            <p class="description">${project.description}</p>
        `;
    

        if (project.type === "0") {
          cardHTML += `<div class="button-container">`;
          project.buttonList.forEach(button => {
            if (button.type === "0") { // Source-link button
              cardHTML += `<a class="source-link" target="_blank" href="${button.link}">
                            ${button.label} <i class="material-icons">${button.icon}</i>
                           </a>`;
            } else if (button.type === "1") { // Download button
              cardHTML += `<a class="download" target="_blank" href="${button.link}">
                            ${button.label} <i class="material-icons">${button.icon}</i>
                           </a>`;
            }
          });
          cardHTML += `</div>`;
        }
    
        cardHTML += `</div>`;
    

        projects.insertAdjacentHTML("beforeend", cardHTML);
      });
    

      AOS.refresh();
    });