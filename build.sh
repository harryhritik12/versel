#!/usr/bin/env bash

# Update and install dependencies
apt-get update && apt-get install -y qpdf libreoffice

# Ensure LibreOffice and qpdf are installed
libreoffice --version
qpdf --version
