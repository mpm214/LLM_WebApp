console.log("knowledge_graph.js loaded");

let selectedNode = null;
let metadata = new Map();
let scene, camera, renderer, raycaster, mouse;
let mouseX = 0, mouseY = 0;
let nodes = new Map();
let cameraDistance = 50;
let highlightedLines = [];
const normalLineColor = 0xaaaaaa;
const highlightLineColor = 0xff0000;
const normalLineWidth = 1;
const highlightLineWidth = 3;
const minDistance = 10;
const maxDistance = 100;

const clusters = {
    "AI and Machine Learning": "#FF4136",
    "Data Science and Analytics": "#0074D9",
    "Computer Science": "#2ECC40",
    "Robotics and Automation": "#FF851B",
    "Internet and Networking": "#B10DC9",
    "Cybersecurity": "#FFDC00",
    "Emerging Technologies": "#39CCCC",
    "Biotechnology and Health": "#85144b",
    "Energy and Environment": "#3D9970",
    "Materials and Manufacturing": "#AAAAAA"
};

// Sample CSV data as a string
// Replace the existing csvData in your knowledge_graph.js file with this expanded version:

const csvData = `topic,x,y,z,size,connections,cluster
Artificial Intelligence,0,0,0,2,"Machine Learning,Deep Learning,Neural Networks,Natural Language Processing,Computer Vision","AI and Machine Learning"
Machine Learning,1,1,1,1.8,"Artificial Intelligence,Deep Learning,Data Science,Statistical Learning,Reinforcement Learning","AI and Machine Learning"
Deep Learning,-1,1,0,1.7,"Artificial Intelligence,Machine Learning,Neural Networks,Computer Vision,Natural Language Processing","AI and Machine Learning"
Neural Networks,-1,-1,1,1.6,"Artificial Intelligence,Deep Learning,Convolutional Neural Networks,Recurrent Neural Networks","AI and Machine Learning"
Natural Language Processing,2,0,1,1.5,"Artificial Intelligence,Deep Learning,Speech Recognition,Machine Translation","AI and Machine Learning"
Computer Vision,-2,0,0,1.5,"Artificial Intelligence,Deep Learning,Image Recognition,Object Detection","AI and Machine Learning"
Data Science,2,2,0,1.7,"Machine Learning,Big Data,Data Mining,Statistics,Data Visualization","Data Science and Analytics"
Big Data,3,1,1,1.6,"Data Science,Hadoop,Spark,NoSQL,Data Mining","Data Science and Analytics"
Robotics,-2,-2,0,1.4,"Artificial Intelligence,Computer Vision,Mechanical Engineering,Control Systems","Robotics and Automation"
Internet of Things,3,-1,-1,1.5,"Cloud Computing,Embedded Systems,Wireless Networks,Sensors","Internet and Networking"
Cloud Computing,4,0,0,1.6,"Big Data,Distributed Systems,Virtualization,Serverless Computing","Internet and Networking"
Cybersecurity,-3,2,1,1.7,"Network Security,Cryptography,Ethical Hacking,Information Security","Cybersecurity"
Blockchain,-4,0,0,1.4,"Cryptocurrency,Distributed Ledger,Smart Contracts,Decentralized Applications","Emerging Technologies"
Quantum Computing,0,3,3,1.3,"Quantum Mechanics,Quantum Algorithms,Quantum Cryptography","Emerging Technologies"
5G Networks,2,-2,-2,1.4,"Wireless Communications,Network Architecture,Mobile Computing","Internet and Networking"
Augmented Reality,-2,2,2,1.5,"Virtual Reality,Computer Graphics,Human-Computer Interaction","Emerging Technologies"
Virtual Reality,-3,-1,2,1.5,"Augmented Reality,Computer Graphics,Gaming,Simulation","Emerging Technologies"
3D Printing,4,-2,1,1.3,"Additive Manufacturing,CAD,Materials Science","Materials and Manufacturing"
Nanotechnology,-4,1,-1,1.4,"Materials Science,Quantum Mechanics,Biotechnology","Materials and Manufacturing"
Biotechnology,1,-3,2,1.5,"Genetic Engineering,Bioinformatics,Synthetic Biology","Biotechnology and Health"
Renewable Energy,3,3,-2,1.6,"Solar Power,Wind Power,Energy Storage,Sustainability","Energy and Environment"
Autonomous Vehicles,-1,3,-3,1.5,"Artificial Intelligence,Computer Vision,Sensor Fusion,Control Systems","Robotics and Automation"
Drones,0,-4,1,1.3,"Robotics,Aerial Photography,Autonomous Systems","Robotics and Automation"
Space Exploration,5,1,-1,1.6,"Rocketry,Astronomy,Satellite Technology,Mars Colonization","Emerging Technologies"
Gene Editing,-3,-3,3,1.4,"CRISPR,Genetic Engineering,Biotechnology,Genomics","Biotechnology and Health"
Smart Cities,2,4,2,1.5,"Internet of Things,Urban Planning,Sustainability,Data Analytics","Emerging Technologies"
Biometrics,-2,4,-2,1.4,"Facial Recognition,Fingerprint Scanning,Identity Management","Cybersecurity"
Edge Computing,4,2,2,1.5,"Internet of Things,Distributed Systems,Real-time Processing","Internet and Networking"
Cryptocurrencies,-5,0,1,1.3,"Blockchain,Digital Currency,Decentralized Finance","Emerging Technologies"
Wearable Technology,1,2,-4,1.4,"Internet of Things,Health Monitoring,Smart Devices","Internet and Networking"
Digital Twin,3,-3,3,1.3,"Simulation,Internet of Things,Data Analytics","Computer Science"
Predictive Analytics,0,5,0,1.5,"Machine Learning,Data Science,Business Intelligence","Data Science and Analytics"
Natural Language Generation,-1,-2,-4,1.4,"Natural Language Processing,Artificial Intelligence,Content Creation","AI and Machine Learning"
Emotion AI,1,-5,0,1.3,"Artificial Intelligence,Computer Vision,Psychology","AI and Machine Learning"
Neuromorphic Computing,-4,3,0,1.3,"Artificial Intelligence,Neural Networks,Computer Architecture","AI and Machine Learning"
Human Augmentation,2,-4,-3,1.4,"Biotechnology,Neurotechnology,Prosthetics","Biotechnology and Health"
Quantum Sensors,-3,0,4,1.2,"Quantum Computing,Nanotechnology,Precision Measurement","Emerging Technologies"
Brain-Computer Interfaces,0,0,5,1.4,"Neurotechnology,Human-Computer Interaction,Neural Networks","Biotechnology and Health"
Synthetic Biology,-2,-4,-2,1.4,"Biotechnology,Genetic Engineering,Bioinformatics","Biotechnology and Health"
Exascale Computing,5,-1,2,1.5,"High Performance Computing,Supercomputers,Scientific Simulations","Computer Science"
Humanoid Robots,-4,-2,2,1.3,"Robotics,Artificial Intelligence,Human-Robot Interaction","Robotics and Automation"
Precision Agriculture,4,4,-1,1.4,"Internet of Things,Drones,Data Analytics,Sustainability","Energy and Environment"
Smart Materials,2,1,4,1.3,"Materials Science,Nanotechnology,Sensors","Materials and Manufacturing"
Photonics,-1,4,3,1.3,"Optics,Telecommunications,Quantum Computing","Emerging Technologies"
Bioplastics,3,-2,4,1.2,"Materials Science,Sustainability,Chemical Engineering","Materials and Manufacturing"
Fusion Energy,-5,2,-1,1.4,"Nuclear Physics,Energy,Plasma Physics","Energy and Environment"
Hypersonic Technology,1,3,-5,1.3,"Aerospace Engineering,Materials Science,Propulsion","Emerging Technologies"
Biometric Encryption,-3,5,1,1.3,"Cybersecurity,Biometrics,Cryptography","Cybersecurity"
Molecular Nanotechnology,0,-3,-5,1.2,"Nanotechnology,Chemistry,Materials Science","Materials and Manufacturing"
Cognitive Radio Networks,5,0,3,1.3,"Wireless Communications,Artificial Intelligence,Spectrum Management","Internet and Networking"`;

const csvMetadata = `topic,source,title,authors,published_date,summary
Artificial Intelligence,arXiv,"Deep Learning in AI: A Comprehensive Survey","John Smith, Jane Doe",2023-05-15,"This paper provides a comprehensive survey of deep learning techniques in artificial intelligence, covering recent advancements and future directions."
Machine Learning,arXiv,"Advances in Reinforcement Learning for Robotics","Alice Johnson, Bob Williams",2023-04-22,"An exploration of the latest reinforcement learning algorithms and their applications in robotic systems, with a focus on real-world implementations."
Deep Learning,arXiv,"Transformer Models: The Future of NLP","Emily Chen, David Lee",2023-06-01,"This study examines the impact of transformer models on natural language processing tasks, discussing their architecture and potential future developments."
Neural Networks,arXiv,"Biologically Inspired Neural Architectures","Michael Brown, Sarah Davis",2023-03-10,"An investigation into neural network architectures inspired by biological systems, proposing novel approaches for improving AI performance and efficiency."
Natural Language Processing,arXiv,"Multilingual NLP: Challenges and Solutions","Sophia Rodriguez, Alex Kim",2023-05-30,"This paper addresses the challenges in developing multilingual NLP systems and proposes innovative solutions for cross-lingual understanding and generation."
Computer Vision,arXiv,"3D Scene Understanding with Deep Learning","Chris Taylor, Emma White",2023-04-05,"A comprehensive review of deep learning techniques for 3D scene understanding, including object detection, segmentation, and reconstruction methods."
Data Science,arXiv,"Ethical Considerations in Big Data Analytics","Oliver Green, Zoe Black",2023-06-10,"This study explores the ethical implications of big data analytics, proposing guidelines for responsible data usage and privacy protection in data science projects."
Big Data,arXiv,"Scalable Data Processing with Apache Spark","Liam Johnson, Ava Martinez",2023-05-20,"An in-depth analysis of Apache Spark's capabilities for processing large-scale datasets, including performance optimizations and best practices."
Robotics,arXiv,"Human-Robot Collaboration in Manufacturing","Noah Brown, Isabella Lee",2023-04-15,"This paper examines the current state and future prospects of human-robot collaboration in manufacturing environments, addressing safety, efficiency, and social aspects."
Internet of Things,arXiv,"Security Challenges in IoT Ecosystems","Ethan Davis, Mia Wilson",2023-06-05,"A comprehensive survey of security challenges in Internet of Things ecosystems, proposing novel solutions for device authentication and data protection."
Cloud Computing,arXiv,"Serverless Computing: The Future of Cloud","Sophie Martin, Lucas Taylor",2023-05-25,"An analysis of serverless computing paradigms and their impact on cloud architecture, discussing benefits, challenges, and future trends."
Cybersecurity,arXiv,"AI-Powered Cyber Threat Detection","Ryan Johnson, Emma Thompson",2023-04-30,"This paper explores the application of AI techniques in cybersecurity, focusing on advanced threat detection and response mechanisms."
Blockchain,arXiv,"Scalability Solutions for Blockchain Networks","Daniel Lee, Olivia Chen",2023-06-15,"A comprehensive review of scalability challenges in blockchain networks and proposed solutions, including layer-2 protocols and sharding techniques."
Quantum Computing,arXiv,"Quantum Algorithms for Optimization Problems","Zoe Adams, Nathan Patel",2023-05-05,"This study presents novel quantum algorithms for solving complex optimization problems, demonstrating potential speedups over classical methods."
5G Networks,arXiv,"5G and Beyond: Enabling Technologies for 6G","Liam Wilson, Ava Garcia",2023-04-10,"An exploration of cutting-edge technologies that will enable the transition from 5G to 6G networks, including terahertz communications and intelligent surfaces."
Augmented Reality,arXiv,"AR in Education: Enhancing Learning Experiences","Sophia Lee, Ethan Brown",2023-06-20,"This paper discusses the applications of augmented reality in educational settings, presenting case studies and evaluating its impact on student engagement and learning outcomes."
Virtual Reality,arXiv,"Haptic Feedback Systems for Immersive VR","Jack Taylor, Emma Davis",2023-05-10,"An investigation into advanced haptic feedback technologies for virtual reality, enhancing user immersion and interaction in virtual environments."
3D Printing,arXiv,"Bioprinting: 3D Printing for Medical Applications","Mia Johnson, Noah Williams",2023-04-25,"This study explores the use of 3D printing technologies in medical applications, focusing on tissue engineering and personalized medical devices."
Nanotechnology,arXiv,"Nanorobots for Targeted Drug Delivery","Ava Thompson, Liam Garcia",2023-06-05,"A comprehensive review of nanorobot designs and control mechanisms for targeted drug delivery, discussing potential applications in cancer treatment."
Biotechnology,arXiv,"CRISPR-Cas9: Advancements and Ethical Considerations","Oliver Brown, Sophie Wilson",2023-05-15,"This paper examines recent advancements in CRISPR-Cas9 gene editing technology, addressing both scientific progress and associated ethical challenges."
Renewable Energy,arXiv,"Next-Generation Solar Cell Materials","Emma Martin, Ryan Davis",2023-04-20,"An exploration of emerging materials for high-efficiency solar cells, including perovskites and multi-junction cells, and their potential impact on renewable energy adoption."
Autonomous Vehicles,arXiv,"Ethical Decision-Making in Self-Driving Cars","Lucas Adams, Zoe Taylor",2023-06-10,"This study addresses the ethical challenges in programming decision-making algorithms for autonomous vehicles, proposing frameworks for handling complex scenarios."
Drones,arXiv,"Swarm Intelligence in Drone Networks","Nathan Lee, Olivia Patel",2023-05-01,"An investigation into swarm intelligence algorithms for coordinating large-scale drone networks, with applications in search and rescue operations and environmental monitoring."
Space Exploration,arXiv,"In-Situ Resource Utilization for Mars Colonization","Ethan Chen, Isabella Johnson",2023-04-15,"This paper discusses strategies for utilizing Martian resources to support long-term human presence on Mars, including oxygen production and construction materials."
Gene Editing,arXiv,"Epigenetic Editing: Beyond CRISPR","Sophie Brown, Jack Wilson",2023-06-25,"An exploration of epigenetic editing techniques as complementary approaches to CRISPR, offering new possibilities for gene regulation and therapy."
Smart Cities,arXiv,"Urban Data Analytics for Sustainable Cities","Liam Davis, Emma Garcia",2023-05-20,"This study presents advanced data analytics techniques for optimizing urban infrastructure and services, promoting sustainability and improving quality of life in smart cities."
Biometrics,arXiv,"Multimodal Biometric Systems for Enhanced Security","Mia Taylor, Noah Martin",2023-04-30,"A comprehensive review of multimodal biometric systems, combining various biometric traits for improved accuracy and security in identity verification."
Edge Computing,arXiv,"Edge AI: Bringing Intelligence to IoT Devices","Ava Wilson, Ryan Thompson",2023-06-15,"This paper explores the integration of AI capabilities into edge devices, discussing challenges, opportunities, and potential applications in various industries."
Cryptocurrencies,arXiv,"Stablecoins: Bridging Traditional and Decentralized Finance","Daniel Brown, Olivia Lee",2023-05-05,"An analysis of stablecoin technologies and their role in connecting traditional financial systems with decentralized finance ecosystems."
Wearable Technology,arXiv,"Health Monitoring Wearables: From Fitness to Medical Applications","Zoe Johnson, Ethan Garcia",2023-04-10,"This study examines the evolution of wearable health monitoring devices, from consumer fitness trackers to medical-grade wearables for continuous patient monitoring."
Digital Twin,arXiv,"Digital Twins in Industry 4.0: Optimizing Manufacturing Processes","Lucas Chen, Sophie Adams",2023-06-20,"An exploration of digital twin technology in Industry 4.0, demonstrating its potential for optimizing manufacturing processes, predictive maintenance, and product design."
Predictive Analytics,arXiv,"Explainable AI for Business Intelligence","Emma Patel, Nathan Davis",2023-05-10,"This paper addresses the need for explainable AI in business intelligence applications, proposing methods to enhance transparency and trust in predictive models."
Natural Language Generation,arXiv,"Controllable Text Generation with Large Language Models","Jack Wilson, Mia Thompson",2023-04-25,"An investigation into techniques for controlling the output of large language models, enabling more precise and reliable text generation for various applications."
Emotion AI,arXiv,"Multimodal Emotion Recognition in Human-Computer Interaction","Olivia Martin, Ryan Lee",2023-06-05,"This study presents advanced techniques for multimodal emotion recognition, combining facial expressions, voice analysis, and physiological signals for improved accuracy."
Neuromorphic Computing,arXiv,"Brain-Inspired Computing Architectures","Liam Taylor, Ava Brown",2023-05-15,"An exploration of neuromorphic computing architectures inspired by the human brain, discussing their potential for energy-efficient AI and cognitive computing."
Human Augmentation,arXiv,"Neuroprosthetics: Merging Mind and Machine","Sophie Garcia, Ethan Wilson",2023-04-20,"This paper examines recent advancements in neuroprosthetics, exploring brain-computer interfaces and their applications in restoring and enhancing human capabilities."
Quantum Sensors,arXiv,"Quantum Sensing for Precision Measurements","Noah Adams, Isabella Chen",2023-06-10,"A comprehensive review of quantum sensing technologies and their applications in high-precision measurements, from gravitational wave detection to medical imaging."
Brain-Computer Interfaces,arXiv,"Non-Invasive BCIs for Communication and Control","Emma Johnson, Lucas Patel",2023-05-01,"This study investigates non-invasive brain-computer interface technologies, focusing on their potential for assisting individuals with severe motor disabilities."
Synthetic Biology,arXiv,"Engineering Microorganisms for Sustainable Chemical Production","Zoe Davis, Nathan Brown",2023-04-15,"An exploration of synthetic biology approaches for engineering microorganisms to produce sustainable chemicals and materials, addressing environmental challenges."
Exascale Computing,arXiv,"Exascale Systems for Climate Modeling","Mia Wilson, Ethan Thompson",2023-06-25,"This paper discusses the development and application of exascale computing systems for high-resolution climate modeling, enabling more accurate predictions of climate change impacts."
Humanoid Robots,arXiv,"Social Robots: Enhancing Human-Robot Interaction","Ava Lee, Ryan Chen",2023-05-20,"An investigation into the design and development of social humanoid robots, addressing challenges in natural interaction, emotion recognition, and social intelligence."
Precision Agriculture,arXiv,"AI-Driven Crop Management for Sustainable Farming","Daniel Garcia, Olivia Davis",2023-04-30,"This study presents AI-driven approaches for precision agriculture, optimizing crop management through sensor networks, drone imagery, and predictive analytics."
Smart Materials,arXiv,"Self-Healing Materials for Sustainable Infrastructure","Sophie Thompson, Jack Brown",2023-06-15,"An exploration of self-healing materials and their potential applications in sustainable infrastructure, addressing durability and maintenance challenges in construction."
Photonics,arXiv,"Integrated Photonics for Quantum Computing","Lucas Wilson, Emma Martin",2023-05-05,"This paper examines the role of integrated photonics in quantum computing, discussing recent advancements in photonic qubit manipulation and quantum communication."
Bioplastics,arXiv,"Biodegradable Plastics from Agricultural Waste","Zoe Taylor, Noah Lee",2023-04-10,"An investigation into the production of biodegradable plastics from agricultural waste, addressing environmental concerns associated with traditional plastics."
Fusion Energy,arXiv,"Advances in Magnetic Confinement Fusion","Liam Johnson, Ava Chen",2023-06-20,"This study reviews recent progress in magnetic confinement fusion research, discussing challenges and potential solutions for achieving sustainable fusion energy."
Hypersonic Technology,arXiv,"Materials for Hypersonic Vehicles","Mia Brown, Ethan Garcia",2023-05-10,"An exploration of advanced materials for hypersonic vehicles, addressing challenges in heat resistance, aerodynamics, and structural integrity at extreme speeds."
Biometric Encryption,arXiv,"Privacy-Preserving Biometric Authentication","Oliver Davis, Isabella Wilson",2023-04-25,"This paper presents novel approaches to biometric encryption, ensuring privacy and security in biometric authentication systems through advanced cryptographic techniques."
Molecular Nanotechnology,arXiv,"Molecular Machines for Targeted Drug Delivery","Emma Thompson, Ryan Adams",2023-06-05,"An investigation into the design and application of molecular machines for targeted drug delivery, exploring their potential in personalized medicine and cancer treatment."
Cognitive Radio Networks,arXiv,"AI-Enabled Spectrum Sharing in 6G Networks","Sophie Lee, Nathan Martin",2023-05-15,"This study examines the application of AI techniques in cognitive radio networks for efficient spectrum sharing, addressing challenges in future 6G wireless communications."`;

class TopicNode {
    constructor(name, x, y, z, size, cluster) {
        this.name = name;
        this.position = new THREE.Vector3(x, y, z);
        this.size = size;
        this.cluster = cluster;
        this.connections = [];
        this.connectionLines = [];

        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: clusters[cluster] || "#FFFFFF" });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        this.mesh.userData.name = name;
        this.mesh.userData.cluster = cluster;
    }

    addConnection(otherNode, line) {
        this.connections.push(otherNode);
        this.connectionLines.push(line);
    }
}

function createLine(start, end, color, width) {
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: width });
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    return new THREE.Line(geometry, material);
}

function highlightConnections(node) {
    unhighlightConnections();
    node.connectionLines.forEach(line => {
        line.material.color.setHex(highlightLineColor);
        line.material.linewidth = highlightLineWidth;
        highlightedLines.push(line);
    });
}

function unhighlightConnections() {
    highlightedLines.forEach(line => {
        line.material.color.setHex(normalLineColor);
        line.material.linewidth = normalLineWidth;
    });
    highlightedLines = [];
}

function initScene() {
    console.log("Initializing scene");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('graph-container').appendChild(renderer.domElement);

    camera.position.z = 50;  // Adjust as needed

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Mouse move event listener
    document.addEventListener('mousemove', onMouseMove);
    
    // Add click event listener
    document.addEventListener('click', onMouseClick);

    // Add wheel event listener for zooming (if you have zoom functionality)
    document.addEventListener('wheel', onMouseWheel);
}

function onMouseClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    const metadataBox = document.getElementById('metadata-box');

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.name) {
            if (selectedNode === intersectedObject) {
                // If clicking the same node, deselect it
                selectedNode = null;
                metadataBox.style.display = 'none';
            } else {
                // Select the new node
                selectedNode = intersectedObject;
                const topicName = selectedNode.userData.name;
                const topicMetadata = metadata.get(topicName);
                if (topicMetadata) {
                    const truncatedSummary = truncateText(topicMetadata.summary, 300); // Adjust 300 as needed
                    metadataBox.innerHTML = `
                        <h3>${topicName}</h3>
                        <p><strong>Source:</strong> ${topicMetadata.source}</p>
                        <p><strong>Title:</strong> <a href="#" target="_blank">${topicMetadata.title}</a></p>
                        <p><strong>Authors:</strong> ${topicMetadata.authors}</p>
                        <p><strong>Published Date:</strong> ${topicMetadata.published_date}</p>
                        <p><strong>Summary:</strong> ${truncatedSummary}</p>
                    `;
                    metadataBox.style.display = 'block';
                }
            }
        }
    } else {
        // Clicked outside any node, deselect
        selectedNode = null;
        metadataBox.style.display = 'none';
    }
}

function onMouseWheel(event) {
    event.preventDefault();
    
    cameraDistance += event.deltaY * 0.05;
    cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance));
    
    updateCameraPosition();
}

function updateCameraPosition() {
    const theta = mouseX * Math.PI;
    const phi = mouseY * Math.PI / 2;
    
    camera.position.x = cameraDistance * Math.sin(theta) * Math.cos(phi);
    camera.position.y = cameraDistance * Math.sin(phi);
    camera.position.z = cameraDistance * Math.cos(theta) * Math.cos(phi);
    
    camera.lookAt(scene.position);
}

function createKnowledgeGraph() {
    console.log("Creating knowledge graph");
    const data = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;
    const metadataData = Papa.parse(csvMetadata, { header: true, skipEmptyLines: true }).data;

    // Load metadata
    metadataData.forEach(row => {
        metadata.set(row.topic, row);
    });

    const scaleFactor = 3;
    const sizeReductionFactor = 0.1;

    // Create nodes
    data.forEach(row => {
        const x = parseFloat(row.x) * scaleFactor;
        const y = parseFloat(row.y) * scaleFactor;
        const z = parseFloat(row.z) * scaleFactor;
        const size = parseFloat(row.size) * sizeReductionFactor;

        const node = new TopicNode(row.topic, x, y, z, size, row.cluster);
        nodes.set(row.topic, node);
        scene.add(node.mesh);
    });

    // Create connections
    data.forEach(row => {
        const sourceNode = nodes.get(row.topic);
        row.connections.split(',').forEach(connectedTopic => {
            const targetNode = nodes.get(connectedTopic.trim());
            if (targetNode) {
                const line = createLine(sourceNode.position, targetNode.position, normalLineColor, normalLineWidth);
                sourceNode.addConnection(targetNode, line);
                targetNode.addConnection(sourceNode, line);  // Add this line to make connections bidirectional
                scene.add(line);
            }
        });
    });

    console.log("Knowledge graph created");
}

function onMouseMove(event) {
    // Update mouse position for camera control
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -((event.clientY / window.innerHeight) * 2 - 1);

    // Update mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update tooltip position
    const tooltip = document.getElementById('tooltip');
    tooltip.style.left = (event.clientX + 10) + 'px';
    tooltip.style.top = (event.clientY + 10) + 'px';
}

function checkIntersections() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    const tooltip = document.getElementById('tooltip');
    const metadataBox = document.getElementById('metadata-box');

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData.name) {
            const topicName = intersectedObject.userData.name;
            tooltip.innerHTML = `<strong>${topicName}</strong><br>Cluster: ${intersectedObject.userData.cluster}`;
            tooltip.style.display = 'block';

            // Highlight connections
            highlightConnections(nodes.get(topicName));

            // Display metadata only if no node is currently selected
            if (!selectedNode) {
                const topicMetadata = metadata.get(topicName);
                if (topicMetadata) {
                    const truncatedSummary = truncateText(topicMetadata.summary, 300); // Adjust 300 as needed
                    metadataBox.innerHTML = `
                        <h3>${topicName}</h3>
                        <p><strong>Source:</strong> ${topicMetadata.source}</p>
                        <p><strong>Title:</strong> <a href="#" target="_blank">${topicMetadata.title}</a></p>
                        <p><strong>Authors:</strong> ${topicMetadata.authors}</p>
                        <p><strong>Published Date:</strong> ${topicMetadata.published_date}</p>
                        <p><strong>Summary:</strong> ${truncatedSummary}</p>
                    `;
                    metadataBox.style.display = 'block';
                } else {
                    metadataBox.style.display = 'none';
                }
            }
        }
    } else {
        tooltip.style.display = 'none';
        unhighlightConnections();
        
        // Hide metadata only if no node is selected
        if (!selectedNode) {
            metadataBox.style.display = 'none';
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    updateCameraPosition();
    checkIntersections();

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength - 3) + '...';
}

function init() {
    console.log("Initializing application");
    initScene();
    createKnowledgeGraph();
    animate();
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('click', onMouseClick);
}

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', init);