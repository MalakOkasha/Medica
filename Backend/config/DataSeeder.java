package com.example.demo.config;

import com.example.demo.model.ActiveIngredients;
import com.example.demo.repository.ActiveIngredientsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedActiveIngredientss(ActiveIngredientsRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new ActiveIngredients("Lisinopril", "Lisinopril is an angiotensin-converting enzyme (ACE) inhibitor that is commonly prescribed for managing hypertension in patients aged 50 or younger. By inhibiting the ACE enzyme, Lisinopril reduces the production of angiotensin II, a potent vasoconstrictor. This leads to vasodilation, lower blood pressure, and reduced strain on the heart. Lisinopril is also beneficial in preventing the progression of kidney disease in patients with hypertension."));

                repository.save(new ActiveIngredients("Amlodipine", "Amlodipine is a calcium channel blocker used to treat hypertension in patients aged 51 to 70. It works by inhibiting calcium ion influx into vascular smooth muscle and cardiac muscle cells. This results in vasodilation, thereby reducing blood pressure. Amlodipine is well-tolerated and effective in both primary and secondary hypertension, improving blood flow and reducing the workload on the heart."));

                repository.save(new ActiveIngredients("Hydrochlorothiazide", "Hydrochlorothiazide is a thiazide diuretic commonly used in older adults (age >70) for the management of hypertension. It works by inhibiting sodium reabsorption in the distal convoluted tubules of the kidneys, leading to increased urine output and decreased blood volume. This reduction in blood volume helps to lower blood pressure. Hydrochlorothiazide is often combined with other antihypertensive agents to enhance its efficacy."));

                repository.save(new ActiveIngredients("Metformin", "Metformin is a biguanide-class medication used as a first-line treatment for type 2 diabetes in patients with controlled blood glucose levels. It works by decreasing hepatic glucose production and increasing peripheral insulin sensitivity, thereby lowering blood sugar levels. Metformin is considered the cornerstone of diabetes management due to its efficacy, low cost, and favorable side-effect profile."));

                repository.save(new ActiveIngredients("Insulin", "Insulin is a peptide hormone used for the management of type 2 diabetes in patients with uncontrolled blood sugar levels. It helps regulate blood glucose by facilitating the uptake of glucose into cells for energy production. In patients with uncontrolled diabetes, insulin therapy is essential to restore glycemic control and prevent the complications associated with hyperglycemia."));

                repository.save(new ActiveIngredients("Azithromycin", "Azithromycin is a macrolide antibiotic used to treat a variety of bacterial infections, including respiratory infections, skin infections, and sexually transmitted diseases. It works by inhibiting bacterial protein synthesis, preventing bacterial growth and replication. Azithromycin is preferred in patients allergic to penicillin due to its broad-spectrum activity and lower risk of allergic reactions."));

                repository.save(new ActiveIngredients("Amoxicillin", "Amoxicillin is a penicillin-class antibiotic effective against a wide range of bacterial infections, including otitis media, pneumonia, and urinary tract infections. It works by interfering with bacterial cell wall synthesis, leading to cell lysis and death. Amoxicillin is well-tolerated and frequently prescribed as a first-line treatment for many common bacterial infections."));

                repository.save(new ActiveIngredients("Albuterol", "Albuterol is a short-acting beta-agonist used for the treatment of mild asthma symptoms. It works by stimulating beta-2 receptors in the bronchial smooth muscle, leading to relaxation and bronchodilation. This effect helps relieve acute asthma attacks by improving airflow and reducing bronchospasm. Albuterol provides rapid relief and is often used as a rescue inhaler."));

                repository.save(new ActiveIngredients("Fluticasone", "Fluticasone is an inhaled corticosteroid used for the management of severe asthma. It reduces inflammation within the airways by inhibiting the release of inflammatory mediators. Fluticasone is used as a maintenance therapy in asthma to prevent exacerbations and improve long-term control of the disease. It is often combined with a long-acting beta-agonist for enhanced bronchodilation."));

                repository.save(new ActiveIngredients("Simvastatin", "Simvastatin is a statin medication used to lower low-density lipoprotein (LDL) cholesterol in patients with hyperlipidemia. It works by inhibiting the enzyme HMG-CoA reductase, which is responsible for cholesterol production in the liver. Reducing LDL cholesterol levels helps prevent the progression of atherosclerosis, lowering the risk of cardiovascular events such as heart attacks and strokes."));

                repository.save(new ActiveIngredients("Atorvastatin", "Atorvastatin is a potent statin used to lower high LDL cholesterol levels in patients with hyperlipidemia, particularly when LDL levels are greater than or equal to 130 mg/dL. By inhibiting HMG-CoA reductase, atorvastatin reduces cholesterol production and decreases overall cholesterol levels, thereby reducing the risk of atherosclerosis, heart attacks, and other cardiovascular diseases."));

                repository.save(new ActiveIngredients("Carvedilol", "Carvedilol is a non-selective beta-blocker and alpha-1 blocker used to manage heart failure with reduced ejection fraction (EF<40%). It works by reducing the heart's workload, improving cardiac output, and lowering blood pressure. Carvedilol is also beneficial in reducing symptoms, preventing hospitalizations, and improving survival in patients with heart failure."));

                repository.save(new ActiveIngredients("Furosemide", "Furosemide is a loop diuretic used in heart failure patients with an ejection fraction (EF) greater than or equal to 40%. It works by inhibiting sodium and chloride reabsorption in the loop of Henle in the kidneys, leading to increased urine production and decreased fluid retention. This reduction in fluid volume helps alleviate symptoms of heart failure, such as edema and pulmonary congestion."));

                repository.save(new ActiveIngredients("Omeprazole", "Omeprazole is a proton pump inhibitor (PPI) used for the short-term management of gastroesophageal reflux disease (GERD) symptoms lasting less than or equal to 3 weeks. It works by inhibiting the H+/K+ ATPase pump in the stomach lining, reducing gastric acid secretion. This provides relief from heartburn, acid regurgitation, and esophageal irritation caused by acid reflux."));

                repository.save(new ActiveIngredients("Pantoprazole", "Pantoprazole is a proton pump inhibitor (PPI) used for the treatment of GERD with symptoms lasting longer than 3 weeks. By inhibiting gastric acid secretion, pantoprazole helps to heal esophageal damage, reduce inflammation, and prevent further acid reflux. It is often prescribed for chronic GERD management, reducing symptoms and the risk of complications such as esophagitis."));

                repository.save(new ActiveIngredients("Levothyroxine", "Levothyroxine is a synthetic form of the thyroid hormone thyroxine (T4) used to treat hypothyroidism. It works by increasing the levels of thyroid hormone in the bloodstream, thereby normalizing metabolic processes. Levothyroxine is the standard treatment for hypothyroidism, effectively restoring normal thyroid function and alleviating symptoms such as fatigue, weight gain, and cold intolerance."));
            }
        };
    }
}