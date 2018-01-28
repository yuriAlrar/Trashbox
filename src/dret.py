# coding:utf-8
import socket
import cgi
import os
import sys
import io
import os.path
import string
import random
import datetime
import locale
import hashlib
import datetime
import codecs
import http
import http.cookies
import http.cookiejar
import gzip
import shutil
import struct
import mimetypes
import datetime
import random
sys.path.append('/var/www/trashbox/Trashbox/src')
import extlib
import json
import handler

def application(environ, start_response):
	flag = False
	ExtLib = extlib.extlib()
	Rqs = handler.handler(environ)
	Rqs.status = '404 Not Found'
	Rqs.response = [('Content-type', 'text/html')]

	method = environ.get('REQUEST_METHOD')
	if method != "POST":
		start_response( Rqs.status , Rqs.response )
		return[str(flag).encode()]
	wsgi_input = environ['wsgi.input']
	form = cgi.FieldStorage(fp=wsgi_input,environ=environ,keep_blank_values=True)
	pst_key = form.keys()
#認証
	if "@auth" in form and Rqs.acsAuth( form["@auth"].value  ):
		uri = '/var/www/trashbox/archive/'
		if not os.path.isdir(uri):
			os.mkdir( uri )
		if( os.path.exists( uri.encode("utf-8") ) ):
			dict_data = ExtLib.headerlist(uri)
			enc_json = json.dumps( dict_data )
			start_response('200 OK', [('Content-type', 'text/html')])
			return[enc_json.encode()]
	start_response( Rqs.status , Rqs.response )
	return[str(flag).encode()]
