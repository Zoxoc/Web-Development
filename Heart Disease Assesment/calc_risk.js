document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('risk-assessment-form');
    const loadingIndicator = document.getElementById('loading');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    const riskFactorsList = document.getElementById('risk-factors-list');
    const reassessBtn = document.getElementById('reassess-btn');
    const cigsPerDayGroup = document.getElementById('cigsPerDayGroup');
    const currentSmokerSelect = document.getElementById('currentSmoker');

    currentSmokerSelect.addEventListener('change', function () {
        if (this.value === '0') {
            document.getElementById('cigsPerDay').value = '0';
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        loadingIndicator.classList.add('visible');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        for (const key in data) {
            data[key] = Number(data[key]);
        }
        setTimeout(() => {
            calculateRisk(data);
            loadingIndicator.classList.remove('visible');
            resultSection.classList.add('visible');
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }, 1500);
    });

    form.addEventListener('reset', function () {
        resultSection.classList.remove('visible');
    });

    reassessBtn.addEventListener('click', function () {
        resultSection.classList.remove('visible');
        form.scrollIntoView({ behavior: 'smooth' });
    });

    function calculateRisk(data) {
        const weights = [
            0.00508508, 0.09446021, -0.01554759, -0.00034687, 0.07337258, 0.00210638,
            0.00076019, 0.01087632, 0.00210511, -0.00416489, 0.13435222, -0.07432936,
            -0.07287122, -0.16229414, 0.03494732
        ];
        const bias = 0;
        const features = [
            data.age, data.male, data.currentSmoker, data.cigsPerDay, data.sysBP, data.diaBP,
            data.BPMeds, data.totChol, data.diabetes, data.glucose, data.BMI,
            data.prevalentStroke, data.prevalentHyp, data.heartRate, 1
        ];
        let riskScore = features.reduce((sum, value, index) => sum + value * weights[index], bias);
        const riskFactors = [];

        if (data.age > 65) riskFactors.push("Age over 65");
        if (data.currentSmoker === 1) riskFactors.push("Current smoker");
        if (data.sysBP >= 140 || data.diaBP >= 90) riskFactors.push("High blood pressure");
        if (data.BMI >= 30) riskFactors.push("High BMI (Obesity)");
        if (data.diabetes === 1) riskFactors.push("Diabetes");
        if (data.totChol >= 240) riskFactors.push("High cholesterol");
        if (data.prevalentStroke === 1) riskFactors.push("History of stroke");
        if (data.prevalentHyp === 1) riskFactors.push("Hypertension");

        let riskCategory, riskDescription, riskClass, recommendations;
        if (riskScore >= 70) {
            riskCategory = "High Risk";
            riskClass = "high-risk";
            riskDescription = "Your assessment indicates factors that are associated with a higher risk of heart disease.";
            recommendations = "It's strongly recommended that you consult with a healthcare provider as soon as possible to discuss these risk factors and develop a personalized heart health plan.";
        } else if (riskScore >= 40) {
            riskCategory = "Moderate Risk";
            riskClass = "moderate-risk";
            riskDescription = "Your assessment shows some factors that may increase your risk of heart disease.";
            recommendations = "Consider scheduling a check-up with your healthcare provider to discuss these risk factors and potential lifestyle modifications.";
        } else {
            riskCategory = "Low Risk";
            riskClass = "low-risk";
            riskDescription = "Based on the information provided, your current risk factors for heart disease appear to be low.";
            recommendations = "Continue maintaining healthy habits and have regular check-ups with your healthcare provider.";
        }

        resultContent.className = `result-content ${riskClass}`;
        resultContent.innerHTML = `
            <h3>${riskCategory}</h3>
            <p>${riskDescription}</p>
            <p><strong>Recommendation:</strong> ${recommendations}</p>
        `;

        riskFactorsList.innerHTML = '';
        if (riskFactors.length > 0) {
            riskFactors.forEach(factor => {
                const li = document.createElement('li');
                li.textContent = factor;
                riskFactorsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = "No significant risk factors identified.";
            riskFactorsList.appendChild(li);
        }
    }
});