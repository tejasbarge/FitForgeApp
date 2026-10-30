package com.fitforge.config;

import com.fitforge.model.Exercise;
import com.fitforge.repository.ExerciseRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class ExerciseCatalogInitializer implements ApplicationRunner {

    private final ExerciseRepository exerciseRepository;

    public ExerciseCatalogInitializer(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        List<Exercise> catalog = List.of(
                exercise("Push-up", "Chest, Shoulders, Triceps", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "BACK_PAIN",
                        "Keep your body in a straight line; lower with control and press the floor away."),
                exercise("Glute bridge", "Glutes, Hamstrings", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "",
                        "Lie on your back with knees bent; squeeze your glutes to raise your hips."),
                exercise("Bird-dog", "Core, Back", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "",
                        "From hands and knees, extend opposite arm and leg while keeping your spine neutral."),
                exercise("Dead bug", "Core", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "",
                        "Lie on your back and slowly lower opposite arm and leg without arching your back."),
                exercise("Chair sit-to-stand", "Quadriceps, Glutes", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "KNEE_PAIN",
                        "Stand up from a stable chair and sit back slowly; use a comfortable pain-free range."),
                exercise("Wall push-up", "Chest, Shoulders, Triceps", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "",
                        "Place hands on a wall and bend your elbows to bring your chest toward it."),
                exercise("Standing calf raise", "Calves", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "",
                        "Hold a stable support and raise your heels slowly, then lower with control."),
                exercise("March in place", "Cardio, Legs", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "",
                        "March at a comfortable pace, keeping the movement low impact."),
                exercise("Standing wall sit", "Quadriceps, Glutes", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "KNEE_PAIN",
                        "Slide down a wall only to a comfortable position and hold while breathing normally."),
                exercise("Standing shoulder tap", "Core, Shoulders", "BEGINNER", "BODYWEIGHT", "FULL_BODY", "WRIST_PAIN",
                        "Stand facing a wall, brace gently, and alternate touching each shoulder."),

                exercise("Dumbbell bench press", "Chest, Triceps", "INTERMEDIATE", "DUMBBELLS", "UPPER", "BACK_PAIN",
                        "Keep feet planted and wrists stacked; lower dumbbells to chest level and press up."),
                exercise("One-arm dumbbell row", "Back, Biceps", "INTERMEDIATE", "DUMBBELLS", "UPPER", "BACK_PAIN",
                        "Support one hand on a bench, keep your back neutral, and pull the dumbbell toward your hip."),
                exercise("Seated dumbbell shoulder press", "Shoulders, Triceps", "BEGINNER", "DUMBBELLS", "UPPER", "",
                        "Sit tall and press dumbbells overhead only through a comfortable range."),
                exercise("Resistance band row", "Back, Biceps", "BEGINNER", "RESISTANCE_BANDS", "UPPER", "",
                        "Anchor the band safely, sit or stand tall, and draw elbows back."),
                exercise("Incline push-up", "Chest, Shoulders, Triceps", "BEGINNER", "BODYWEIGHT", "UPPER", "",
                        "Place hands on a sturdy elevated surface and lower your chest with control."),
                exercise("Dumbbell biceps curl", "Biceps", "BEGINNER", "DUMBBELLS", "UPPER", "",
                        "Keep elbows near your sides and curl without swinging."),
                exercise("Dumbbell lateral raise", "Shoulders", "INTERMEDIATE", "DUMBBELLS", "UPPER", "",
                        "Raise light dumbbells to the sides with soft elbows and controlled lowering."),
                exercise("Standing wall angel", "Shoulders, Upper Back", "BEGINNER", "BODYWEIGHT", "UPPER", "",
                        "Stand against a wall and slide your arms upward only through a comfortable range."),
                exercise("Kneeling incline push-up", "Chest, Triceps", "BEGINNER", "BODYWEIGHT", "UPPER", "KNEE_PAIN",
                        "Use a sturdy elevated surface and keep your body aligned while pressing."),

                exercise("Dumbbell Romanian deadlift", "Hamstrings, Glutes", "INTERMEDIATE", "DUMBBELLS", "LOWER", "BACK_PAIN",
                        "Hinge at the hips with a neutral back and lower weights along your legs."),
                exercise("Goblet squat to box", "Quadriceps, Glutes", "BEGINNER", "DUMBBELLS", "LOWER", "KNEE_PAIN",
                        "Hold one dumbbell at your chest and sit toward a box to a pain-free depth."),
                exercise("Bodyweight box squat", "Quadriceps, Glutes", "BEGINNER", "BODYWEIGHT", "LOWER", "KNEE_PAIN",
                        "Sit back to a sturdy chair or box and stand with control."),
                exercise("Standing hip abduction", "Glutes, Hips", "BEGINNER", "BODYWEIGHT", "LOWER", "",
                        "Hold support and move one leg gently out to the side without leaning."),
                exercise("Resistance band hamstring curl", "Hamstrings", "BEGINNER", "RESISTANCE_BANDS", "LOWER", "",
                        "Anchor a band securely and bend your knee slowly against light resistance."),
                exercise("Dumbbell step-up", "Quadriceps, Glutes", "INTERMEDIATE", "DUMBBELLS", "LOWER", "KNEE_PAIN",
                        "Use a low stable step, drive through the whole foot, and step down slowly."),

                exercise("Dumbbell floor press", "Chest, Triceps", "BEGINNER", "DUMBBELLS", "PUSH", "",
                        "Lie on the floor and press dumbbells upward; gently touch upper arms down between reps."),
                exercise("Dumbbell overhead press", "Shoulders, Triceps", "INTERMEDIATE", "DUMBBELLS", "PUSH", "",
                        "Brace your core and press dumbbells overhead without arching your back."),
                exercise("Close-grip wall push-up", "Triceps, Chest", "BEGINNER", "BODYWEIGHT", "PUSH", "",
                        "Place hands close on a wall and bend elbows while keeping your body aligned."),
                exercise("Resistance band chest press", "Chest, Triceps", "BEGINNER", "RESISTANCE_BANDS", "PUSH", "",
                        "Secure the band behind you and press forward without shrugging."),
                exercise("Dumbbell triceps extension", "Triceps", "INTERMEDIATE", "DUMBBELLS", "PUSH", "",
                        "Keep upper arms steady and extend elbows with a light weight."),

                exercise("Chest-supported dumbbell row", "Back, Biceps", "BEGINNER", "DUMBBELLS", "PULL", "",
                        "Lie chest-down on an incline bench and row dumbbells toward your ribs."),
                exercise("Resistance band pull-apart", "Upper Back, Shoulders", "BEGINNER", "RESISTANCE_BANDS", "PULL", "",
                        "Hold a band at shoulder height and pull it apart while keeping shoulders relaxed."),
                exercise("Dumbbell reverse fly", "Rear Shoulders, Upper Back", "INTERMEDIATE", "DUMBBELLS", "PULL", "BACK_PAIN",
                        "Hinge slightly with a neutral spine and raise light weights out to your sides."),
                exercise("Dumbbell hammer curl", "Biceps, Forearms", "BEGINNER", "DUMBBELLS", "PULL", "",
                        "Keep palms facing inward and curl without moving your upper arms."),
                exercise("Band lat pulldown", "Back, Biceps", "BEGINNER", "RESISTANCE_BANDS", "PULL", "",
                        "Anchor a band overhead and pull elbows toward your sides."),
                exercise("Prone Y-T raise", "Upper Back, Shoulders", "BEGINNER", "BODYWEIGHT", "PULL", "",
                        "Lie face down and lift your arms gently into Y and T shapes without straining your neck."),

                exercise("Bodyweight hip hinge", "Glutes, Hamstrings", "BEGINNER", "BODYWEIGHT", "LEGS", "BACK_PAIN",
                        "Practice pushing hips back with a neutral spine and soft knees."),
                exercise("Dumbbell split squat", "Quadriceps, Glutes", "ADVANCED", "DUMBBELLS", "LEGS", "KNEE_PAIN",
                        "Use a stable stance and lower only as far as comfortable; hold support if needed."),
                exercise("Dumbbell sumo squat", "Glutes, Inner Thighs", "INTERMEDIATE", "DUMBBELLS", "LEGS", "KNEE_PAIN",
                        "Stand comfortably wide, keep knees tracking with toes, and squat to a pain-free depth."),
                exercise("Glute bridge march", "Glutes, Core", "INTERMEDIATE", "BODYWEIGHT", "LEGS", "",
                        "Hold a glute bridge and alternately lift each foot while keeping hips level."),
                exercise("Seated leg extension", "Quadriceps", "BEGINNER", "MACHINES", "LEGS", "KNEE_PAIN",
                        "Use a light machine setting and extend only through a comfortable range."),
                exercise("Standing hip hinge reach", "Glutes, Hamstrings", "BEGINNER", "BODYWEIGHT", "LEGS", "",
                        "Push hips back with a neutral spine, then return to standing."),
                exercise("Standing side leg raise", "Glutes, Hips", "BEGINNER", "BODYWEIGHT", "LEGS", "",
                        "Hold a stable support and lift your leg gently to the side.")
        );

        for (Exercise exercise : catalog) {
            if (!exerciseRepository.existsByName(exercise.getName())) {
                exerciseRepository.save(exercise);
            }
        }
    }

    private Exercise exercise(String name, String muscleGroup, String difficulty,
                              String equipment, String split, String restrictionTags,
                              String instructions) {
        return Exercise.builder()
                .name(name)
                .muscleGroup(muscleGroup)
                .difficulty(difficulty)
                .requiredEquipment(equipment)
                .splitCategory(split)
                .sets(3)
                .reps("10-12")
                .restTime("60 sec")
                .instructions(instructions)
                .restrictionTags(restrictionTags)
                .build();
    }
}
