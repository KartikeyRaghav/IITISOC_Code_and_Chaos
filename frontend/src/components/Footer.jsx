import React, { useEffect, useState } from "react";
import {
  Zap,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Globe,
  Heart,
  ArrowUp,
  Code,
  Rocket,
  Users,
  Shield,
} from "lucide-react";

const Footer = () => {
  const [userCount, setUserCount] = useState(0);
  const [deploymentCount, setDeploymentCount] = useState(0);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const getStats = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/stats`,
        { credentials: "include" }
      );
      const data = await response.json();
      setDeploymentCount(data.deploymentCount);
      setUserCount(data.userCount);
    };
    getStats();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-[#0a0b1e] via-[#1a1b2e] to-[#23243a] border-t border-purple-500/20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
                <img
                  src={"/logos/logo.png"}
                  className="w-10 h-10 text-white rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                  Ignitia
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  Ignite your web presence
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Transform your ideas into powerful web applications with our
              cutting-edge deployment platform. Build, deploy, and scale with
              confidence.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos"
                target="_blank"
                className="w-10 h-10 bg-[#2c2f4a]/50 hover:bg-blue-500/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 border border-gray-600/30 hover:border-blue-500/30"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/k_raghav_"
                target="_blank"
                className="w-10 h-10 bg-[#2c2f4a]/50 hover:bg-blue-500/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 border border-gray-600/30 hover:border-blue-500/30"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/k-raghav-"
                target="_blank"
                className="w-10 h-10 bg-[#2c2f4a]/50 hover:bg-blue-500/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 border border-gray-600/30 hover:border-blue-500/30"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:sse240021008@iiti.ac.in"
                target="_blank"
                className="w-10 h-10 bg-[#2c2f4a]/50 hover:bg-blue-500/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110 border border-gray-600/30 hover:border-blue-500/30"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              Platform
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Dashboard", href: "/dashboard" },
                { name: "Projects", href: "/projects" },
                { name: "Analytics", href: "/analytics" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              Resources
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Documentation", href: "/docs" },
                { name: "API Reference", href: "/api" },
                { name: "Tutorials", href: "/tutorials" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-[#2c2f4a]/50 to-[#1e1f3a]/50 rounded-2xl p-6 border border-gray-600/20 text-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {deploymentCount}
            </div>
            <div className="text-gray-400 text-sm">Deployments</div>
          </div>

          <div className="bg-gradient-to-br from-[#2c2f4a]/50 to-[#1e1f3a]/50 rounded-2xl p-6 border border-gray-600/20 text-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {userCount}
            </div>
            <div className="text-gray-400 text-sm">Developers</div>
          </div>

          <div className="bg-gradient-to-br from-[#2c2f4a]/50 to-[#1e1f3a]/50 rounded-2xl p-6 border border-gray-600/20 text-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">99.9%</div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>

          <div className="bg-gradient-to-br from-[#2c2f4a]/50 to-[#1e1f3a]/50 rounded-2xl p-6 border border-gray-600/20 text-center backdrop-blur-sm">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-gray-400 text-sm">Support</div>
          </div>
        </div>

        <div className="border-t border-gray-600/30 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>© {currentYear} Ignitia. Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for developers worldwide.</span>
            </div>

            {/* <div className="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </a>
              <a
                href="/cookies"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                Cookie Policy
              </a>
            </div> */}

            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              title="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
