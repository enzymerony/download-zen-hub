import { Globe, TrendingUp, FileText, Wrench } from "lucide-react";
import aboutHeroImage from "@/assets/about-hero.png";

const About = () => {
  const offerings = [
    {
      icon: Globe,
      title: "High-Speed Connectivity",
      description: "Get the best internet and minute bundle packages for all SIM operators."
    },
    {
      icon: TrendingUp,
      title: "Social Media Growth",
      description: "Professional services for Facebook, YouTube, TikTok, and Instagram, including likes, followers, and engagement."
    },
    {
      icon: FileText,
      title: "Professional Identity",
      description: "Expertly crafted CVs and assistance with NID, E-Tin, and birth registration services."
    },
    {
      icon: Wrench,
      title: "Tech & Security",
      description: "Global traffic solutions for websites, IMEI services, and biometric number assistance."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={aboutHeroImage}
          alt="Digital Drive Store Team collaborating on digital projects"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              🚀 About Us: Empowering Your Digital Journey
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Your trusted partner in digital solutions
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground border-l-4 border-blue-500 pl-4 mb-6">
              Welcome to Digital Drive Store
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At <strong className="text-foreground">Digital Drive Store</strong>, we are dedicated to providing a comprehensive suite of digital solutions tailored to meet your everyday needs. From enhancing your social media presence to professional career branding, we bring all essential services under one roof.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ✨ What We Offer
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital services designed to help you succeed
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {offerings.map((offering, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <offering.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">
                      {offering.title}
                    </h4>
                    <p className="text-muted-foreground">
                      {offering.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concluding Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-2xl leading-relaxed">
              We are committed to helping you navigate the digital landscape with ease and confidence, ensuring you have all the tools for success at your fingertips.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
