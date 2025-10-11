import { motion } from "framer-motion";
import { Award, Brain, Star } from "lucide-react";
import teacherImage from "@assets/generated_images/mukeshSirPhoto.jpg";

export default function ProfessorSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Meet the Founder</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The guiding force behind Drishti Institute's success
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Professor Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-1 flex justify-center"
          >
            <div className="relative">
              <img 
                src={teacherImage} 
                alt="Professor Drishti" 
                className="rounded-full shadow-2xl w-64 h-64 lg:w-80 lg:h-80 object-cover"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-full p-4 shadow-lg"
              >
                <Award className="h-8 w-8" />
              </motion.div>
            </div>
          </motion.div>

          {/* Professor Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <h3 className="text-3xl font-bold text-primary">Mukesh Kumar Sir</h3>
              <p className="text-xl text-muted-foreground">Founder & Principal Instructor</p>
            </div>
            <p className="text-lg text-foreground/80">
              With over 20 years of experience in guiding students to success in competitive exams, Mukesh Kumar Sir is a renowned academician and a passionate teacher. An alumnus of IIT Kharagpur, he has dedicated his life to simplifying complex concepts and inspiring students to achieve their full potential.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-8 w-8 text-primary/80" />
                <div>
                  <p className="font-semibold text-lg">IIT Kharagpur Alumnus</p>
                  <p className="text-muted-foreground">M.Tech, Mechanical Engg.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-semibold text-lg">20+ Years of Experience</p>
                  <p className="text-muted-foreground">Mentored 50,000+ students</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}