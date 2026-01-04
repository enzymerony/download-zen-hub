import { Briefcase, Users, Rocket, Heart, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const jobOpenings = [
  {
    title: "Social Media Manager",
    type: "Full-time",
    location: "Remote / Dhaka",
    description: "Lead our social media strategy across Facebook, YouTube, TikTok, and Instagram. Grow engagement and manage campaigns for our clients.",
    requirements: ["2+ years social media experience", "Content creation skills", "Analytics proficiency"],
  },
  {
    title: "Customer Support Specialist",
    type: "Full-time",
    location: "Narayanganj, Dhaka",
    description: "Provide exceptional support to our customers, handle inquiries, and ensure client satisfaction with our digital services.",
    requirements: ["Excellent communication", "Problem-solving skills", "Tech-savvy"],
  },
  {
    title: "Digital Content Creator",
    type: "Part-time / Freelance",
    location: "Remote",
    description: "Create engaging digital content including graphics, videos, and written content for our diverse range of services.",
    requirements: ["Portfolio of work", "Creative mindset", "Adobe Suite / Canva expertise"],
  },
];

const whyJoinUs = [
  {
    icon: Rocket,
    title: "Innovation First",
    description: "Work with cutting-edge digital tools and stay ahead of industry trends.",
  },
  {
    icon: Users,
    title: "Amazing Team",
    description: "Join a diverse, collaborative team that celebrates creativity and growth.",
  },
  {
    icon: Heart,
    title: "Work-Life Balance",
    description: "Flexible schedules and remote options to help you thrive personally and professionally.",
  },
];

const Careers = () => {
  const handleApply = (jobTitle: string) => {
    const subject = encodeURIComponent(`Application for ${jobTitle} Position`);
    const body = encodeURIComponent(`Hi Digital Drive Store Team,\n\nI am interested in applying for the ${jobTitle} position.\n\nPlease find my CV attached.\n\nBest regards,\n[Your Name]`);
    window.location.href = `mailto:ejobs.xyz@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-blue-500/30 text-white border-0 mb-6 px-4 py-2 text-sm">
            We're Hiring!
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Shape the Future of Digital Services with Us!
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Join our passionate team and help businesses and individuals succeed in the digital world. 
            We're looking for creative minds who want to make an impact.
          </p>
          <Button
            size="lg"
            onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg"
          >
            View Open Positions
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Join Digital Drive Store?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe in empowering our team members to grow, innovate, and succeed together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyJoinUs.map((item, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="positions" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our current openings and find your perfect role.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all bg-white overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl text-gray-800 flex items-center gap-3">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                        {job.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {job.type}
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          {job.location}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleApply(job.title)}
                      className="bg-blue-600 hover:bg-blue-700 text-white md:w-auto w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 mb-4">{job.description}</p>
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Requirements:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Don't See the Right Role?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                We're always looking for talented individuals to join our team. Send us your CV and let's explore opportunities together!
              </p>
              <Button
                size="lg"
                onClick={() => handleApply("General Application")}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Your CV
              </Button>
              <p className="mt-6 text-blue-200 text-sm">
                Email: ejobs.xyz@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Careers;
