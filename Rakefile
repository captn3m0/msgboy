# This is a rake file that packs and upload a new version 
require 'crxmake'
require 'nokogiri'
require 'yajl' 
require 'yajl/json_gem'
require 'aws/s3'
require 'selenium-webdriver'
require 'json'
require 'net/http'
require 'git'

s3 = JSON.load(File.read("s3.json"))

def version
  doc = Nokogiri::XML(File.open("updates.xml"))
  version = doc.at("updatecheck")["version"]
end

def ignorefile
  /\.(?:pem|gitignore|DS_Store)|Rakefile|updates.xml/
end

def ignoredir
  /\.(?:git)|build|tests|tmp/
end

def manifest(destination = "")
  FileUtils.remove("./manifest.json", :force => true)
  manifest = {
    :name => "Msgboy",
    :minimum_chrome_version => "12.0.0.0",
    :description => "Msgboy is a chrome extension that allows you to subscribe to the web.",
    :homepage_url => "http://msgboy.com/",
    :options_page => "/views/html/options.html",
    :app => {
      :launch => {
        :local_path => "/views/html/dashboard.html"
      }
    },
    :permissions => [
      "notifications",
      "tabs",
      "background",
      "management",
      "unlimitedStorage",
      "history",
      "bookmarks",
      "http://*/",
      "https://*/"
    ],
    :content_scripts => [
      {
        :js => [
          "/lib/date.format.js",
          "/lib/jquery/jquery.js",
          "/controllers/utils.js",
          "/controllers/plugins.js",
          "/controllers/plugins/bookmarks.js",
          "/controllers/plugins/digg.js",
          "/controllers/plugins/disqus.js",
          "/controllers/plugins/generic.js",
          "/controllers/plugins/google-reader.js",
          "/controllers/plugins/history.js",
          "/controllers/plugins/posterous.js",
          "/controllers/plugins/quora-people.js",
          "/controllers/plugins/quora-topics.js",
          "/controllers/plugins/statusnet.js",
          "/controllers/plugins/tumblr.js",
          "/controllers/plugins/typepad.js",
          "/controllers/plugins/blogger.js",
          "/controllers/run_plugins.js"
        ],
        :css => [
        ],
        :matches => [
          "*://*/*",
        ],
        :run_at => "document_end",
        :all_frames => true,
      }
    ],
    :background_page => "/views/html/background.html",
    :icons => {
      16 => "views/icons/icon16.png",
      48 => "views/icons/icon48.png",
      128 => "views/icons/icon128.png"
    },
    :update_url => "http://sup.ee/update-msgboy",
  }

  case destination
  when "webstore"
    manifest.delete(:update_url)
  end

  manifest[:version] = version # Adds the version
  # Now, write the manifest.json
  File.open("manifest.json","w") do |f|
    f.write(JSON.pretty_generate(manifest))
  end
end

task :lint => [:'lint:validate']
namespace :lint do 
  desc "Validates with jshint"
  task :validate do
    dirs = ["controllers", "models", "views"]
    dirs.each do |dir|
      Dir.glob(File.dirname(__FILE__) + "/#{dir}/**/*.js").each { |f| 
        # And now run jshint
        lint = `jshint #{f}`
        if (lint != "Lint Free!\n" )
          puts "\n--\nCouldn't validate : #{f}"
          puts lint
          # raise ArgumentError, "We couldn't lint your code" 
        end
      }
    end
  end
end

namespace :test do 
  desc "Run tests for models"
  task :models do
    Dir.glob(File.dirname(__FILE__) + '/tests/models/*.js.html').each { |f| 
      puts f
      driver = Selenium::WebDriver.for :chrome
      driver.navigate.to "file://#{f}"
      results = driver.find_element(:id, 'qunit-testresult')
      puts results.text
      driver.quit()
    }
    
    # http://code.google.com/p/selenium/wiki/RubyBindings
    # 
    # driver = Selenium::WebDriver.for :chrome
    # 
    # puts driver.class
    # 
    # driver.navigate.to "file://localhost/Users/julien/repos/msgboy/tests/models/inbox.js.html"
    # 
    # w2 = driver.find_element(:id, 'qunit-testresult')
    # driver.wait.until { w2.displayed? }
    # driver.quit()
    
  end
  
  desc "Run tests for controllers"
  task :controllers do
  
  end
  
end

task :version => [:'version:current']

namespace :version do
  task :bump => [:"lint:validate", :"version:change"]
  
  desc "Bumps version for the extension, both in the updates.xml and the manifest file."
  task :change, :version do |task, args|
    # Makes sure we have no pending commits, and that we're on master
    g = Git.open (".")
    if (g.status.added.empty? and g.status.changed.empty? and g.status.deleted.empty?)
      if (g.branch.name == "master")
        # First, update the updates.xml
        doc = Nokogiri::XML(File.open("updates.xml"))
        doc.at("updatecheck")["version"] = args[:version]
        File.open('updates.xml','w') { |f| 
          doc.write_xml_to f
        }
        manifest() # Rewrite the manifest
        # # Finally, let's tag the repo
        g.commit("Version bump #{version}", { :add_all => true,  :allow_empty => true})
        g.add_tag(version)
      else 
        puts "Please make sure you use the master branch to package new versions"
      end
    else 
      puts "You have pending changed. Please commit them first."
    end
  end

  desc "Prints the version for the extension"
  task :current do
    puts "Current version #{version}"
  end
end

task :publish => [:'publish:chrome:pack', :'publish:upload']

namespace :publish do

  task :upload => [:'upload:crx', :'upload:updates_xml', :'airbrake:track', :'upload:push_git']

  namespace :upload do
    desc "Uploads the extension"
    task :crx do
      AWS::S3::Base.establish_connection!(
      :access_key_id     => s3['access_key_id'],
      :secret_access_key => s3['secret_access_key']
      )
      AWS::S3::S3Object.store(
      'msgboy.crx', 
      open('./build/msgboy.crx'), 
      s3['bucket'], 
      {
        :content_type => 'application/x-chrome-extension',
        :access => :public_read
      }
      )
      puts "Extension #{version} uploaded"
    end

    desc "Uploads the updates.xml file"
    task :updates_xml do
      AWS::S3::Base.establish_connection!(
      :access_key_id     => s3['access_key_id'],
      :secret_access_key => s3['secret_access_key']
      )
      AWS::S3::S3Object.store(
      'updates.xml', 
      open('./updates.xml'), 
      s3['bucket'], 
      {
        :access => :public_read
      }
      )
      puts "Updates.xml #{version} uploaded"
    end
    
    desc "Pushes to the git remotes"
    task :push_git do
      g = Git.open (".")
      res = g.push("origin", "master", true)
      puts res
    end
    
  end
  
  namespace :airbrake do
    desc "Tracks deploy in airbrake"
    task :track do
      commit = `git show`.split("\n")
      scm_revision = commit.select() {|line|
        line.match(/^commit .*/)}[0].match(/commit (.*)/)[1]
      local_username = commit.select() {|line|
        line.match(/Author: .*/)}[0].match(/Author: (.*)/)[1]
      
      response = Net::HTTP.post_form(URI.parse("http://hoptoadapp.com/deploys.txt"), {
        :api_key => "47bdc2ad25b662cee947d0a1c353e974",
        :'deploy[rails_env]' => "production",
        :'deploy[scm_repository]' => "https://github.com/superfeedr/msgboy",
        :'deploy[scm_revision]' => scm_revision,
        :'deploy[local_username]' => local_username,
      })
      
      if (response.is_a? Net::HTTPOK)
        puts "Tracking changes for #{version}"
      else
        puts "Cannot track changes for #{version}"
      end
    end
  end

  namespace :chrome do
    desc "Packs the extension"
    task :pack do
      manifest()
      
      FileUtils.remove("./build/msgboy.crx", :force => true)
      CrxMake.make(
        :ex_dir       => ".",
        :pkey         => "key.pem",
        :crx_output   => "./build/msgboy.crx",
        :verbose      => true,
        :ignorefile   => ignorefile,
        :ignoredir    => ignoredir
      )
      puts "Extension #{version} packed"
    end
    
    desc "Prepares a zip file for the Chorme Webstore" 
    task :zip do
      manifest('webstore')
      # First, we need to create the right manifest.json
      FileUtils.remove("./build/msgboy.zip", :force => true)
      CrxMake.zip(
        :ex_dir       => ".",
        :pkey         => "key.pem",
        :zip_output   => "./build/msgboy.zip",
        :verbose      => true,
        :ignorefile   => ignorefile,
        :ignoredir    => ignoredir
      )
      puts "Extension #{version} zipped"
    end
    
    desc "Creates the manifest file for the destination. If the destination is webstore, we remove the update_url" 
    task :manifest, :destination do |task, args|
      manifest(args[:destination])
    end
    
  end
 
end