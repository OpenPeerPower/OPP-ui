#!/usr/bin/env python3

"""Open Peer Power setup script."""
from datetime import datetime as dt
from setuptools import find_packages, setup

PROJECT_NAME = 'Open Peer Power'
PROJECT_PACKAGE_NAME = 'opp-ui'
PROJECT_LICENSE = 'Apache License 2.0'
PROJECT_AUTHOR = 'Paul Caston'
PROJECT_COPYRIGHT = ' 2020-{}, {}'.format(dt.now().year, PROJECT_AUTHOR)
PROJECT_URL = 'https://OpenPeerPower.io/'
PROJECT_EMAIL = 'paul@caston.id.au'

PROJECT_GITHUB_USERNAME = "OpenPeerPower"
PROJECT_GITHUB_REPOSITORY = "OPP-ui"

PYPI_URL = "https://pypi.python.org/pypi/{}".format(PROJECT_PACKAGE_NAME)
GITHUB_PATH = "{}/{}".format(PROJECT_GITHUB_USERNAME, PROJECT_GITHUB_REPOSITORY)
GITHUB_URL = "https://github.com/{}".format(GITHUB_PATH)

PROJECT_URLS = {
    "Bug Reports": "{}/issues".format(GITHUB_URL)
}
PACKAGES = find_packages(include=["opp_frontend", "opp_frontend.*"])

setup(
    name=PROJECT_PACKAGE_NAME,
    version="0.1.0",
    description="The Open Peer Power user interface",
    url=PROJECT_URL,
    project_urls=PROJECT_URLS,
    author=PROJECT_AUTHOR,
    author_email=PROJECT_EMAIL,
    license="Apache License 2.0",
    packages=PACKAGES,
    include_package_data=True,
    zip_safe=False,
)